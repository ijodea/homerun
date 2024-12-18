import {
  Controller,
  Get,
  Header,
  Res,
  Logger,
  Query,
  HttpException,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private codeProcessingMap = new Map<string, boolean>();
  private readonly frontUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.frontUrl = this.configService.get<string>('FRONT_URL');
  }

  // 일반 로그인
  @Post('login')
  async login(
    @Body('name') name: string,
    @Body('studentId') studentId: string,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    this.logger.debug(
      `Login request received Name: ${name}, StudentID: ${studentId}`,
    );
    return this.authService.login(name, studentId, phoneNumber);
  }

  // 카카오 로그인
  @Get('auth/kakao-login-page')
  @Header('Content-Type', 'text/html')
  async kakaoRedirect(@Res() res: Response): Promise<void> {
    const REST_API_KEY = this.configService.get<string>('KAKAO_REST_API_KEY');
    const REDIRECT_URI = this.configService.get<string>('KAKAO_REDIRECT_URI');
    this.logger.debug(`REST_API_KEY: ${REST_API_KEY}`);
    this.logger.debug(`REDIRECT_URI: ${REDIRECT_URI}`);

    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
    res.redirect(url);
  }

  @Get('oauth')
  async handleKakaoCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      if (!code) {
        throw new HttpException(
          'Authorization code is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 코드 처리 상태 확인
      if (this.codeProcessingMap.get(code)) {
        throw new HttpException(
          'Code is already being processed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 코드 처리 시작 표시
      this.codeProcessingMap.set(code, true);

      this.logger.debug(`Processing code: ${code}`);

      const REST_API_KEY = this.configService.get<string>('KAKAO_REST_API_KEY');
      const REDIRECT_URI = `https://ijodea.github.io/oauth/callback`;

      const userData = await this.authService.kakaoLogin(
        REST_API_KEY,
        REDIRECT_URI,
        code,
      );

      // CORS 헤더 설정
      res.header('Access-Control-Allow-Origin', `https://ijodea.github.io`);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      );
      res.header(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private',
      );
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');

      this.logger.debug('Successfully processed Kakao login');
      return res.status(200).json(userData);
    } catch (error) {
      this.logger.error('Failed to process Kakao login:', error);

      if (!res.headersSent) {
        return res.status(error.status || 500).json({
          error: error.message || 'Failed to process Kakao login',
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      // 일정 시간 후 코드 처리 상태 제거
      setTimeout(() => {
        this.codeProcessingMap.delete(code);
      }, 5000); // 5초 후 제거
    }
  }
}
