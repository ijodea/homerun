import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/jwt-payload.type';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async login(name: string, studentId: string, phoneNumber: string) {
    this.logger.log(`로그인 시도: ${name}, ${studentId}`);

    const isUserValid = await this.usersService.validateUser(
      name,
      studentId,
      phoneNumber,
    );
    this.logger.debug(`user validation result: ${isUserValid}`);

    if (!isUserValid) {
      this.logger.warn('로그인 실패: 유효하지 않은 사용자 정보');
      throw new UnauthorizedException(
        '로그인 실패: 이름, 전화번호, 학번을 확인하세요',
      );
    }

    const payload: JwtPayload = { name, studentId, phoneNumber };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(`로그인 성공: ${name}`);

    // 카카오 로그인과 유사한 응답 구조로 변경
    return {
      userData: {
        id: studentId, // 학번을 ID로 사용
        properties: {
          nickname: name,
        },
      },
      tokenInfo: {
        access_token,
        token_type: 'Bearer',
        expires_in: 3600, // 1시간
      },
    };
  }

  // 카카오 로그인
  async kakaoLogin(REST_API_KEY: string, REDIRECT_URI: string, code: string) {
    try {
      const CLIENT_SECRET = this.configService.get<string>(
        'KAKAO_CLIENT_SECRET',
      );

      const tokenRequestData = {
        grant_type: 'authorization_code',
        client_id: REST_API_KEY,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      };

      this.logger.debug('Token Request Data:', tokenRequestData);

      const params = new URLSearchParams(tokenRequestData).toString();
      const tokenUrl = 'https://kauth.kakao.com/oauth/token';
      const tokenHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Cache-Control': 'no-store',
      };

      this.logger.debug(`Requesting token from: ${tokenUrl}`);

      const tokenResponse = await firstValueFrom(
        this.http.post(tokenUrl, params, { headers: tokenHeaders }),
      );

      this.logger.debug('Token Response received:', tokenResponse.data);

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await firstValueFrom(
        this.http.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Cache-Control': 'no-store',
          },
        }),
      );

      this.logger.debug('User info received');

      return {
        userData: userInfoResponse.data,
        tokenInfo: {
          access_token,
          token_type: tokenResponse.data.token_type,
          expires_in: tokenResponse.data.expires_in,
        },
      };
    } catch (error) {
      this.logger.error(
        'Kakao login error:',
        error.response?.data || error.message,
      );

      throw new Error(
        `Kakao login failed: ${error.response?.data?.error_description || error.response?.data?.msg || error.message}`,
      );
    }
  }
}
