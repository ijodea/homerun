import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

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
