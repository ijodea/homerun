import { Controller, Get, Header, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Query } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('kakao-login-page')
  @Header('Content-Type', 'text/html')
  async kakaoRedirect(@Res() res: Response): Promise<void> {
    const REST_API_KEY = this.configService.get<string>('KAKAO_REST_API_KEY');
    const REDIRECT_URI = this.configService.get<string>('KAKAO_REDIRECT_URI');
    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
    res.redirect(url);
  }

  @Get('kakao')
  async getKakakoInfo(@Query() query: { code }, @Res() res: Response) {
    const REST_API_KEY = this.configService.get<string>('KAKAO_REST_API_KEY');
    const REDIRECT_URI = this.configService.get<string>('KAKAO_REDIRECT_URI');
    const userData = await this.authService.kakaoLogin(
      REST_API_KEY,
      REDIRECT_URI,
      query.code,
    );

    // 사용자 데이터 반환
    res.status(200).json(userData);
  }

  // @Post('kakao')
  // async kakaoLogin(@Body('accessToken') accessToken: string) {
  //   return this.authService.kakaoLogin(accessToken);
  // }
}
