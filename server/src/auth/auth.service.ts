import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private readonly http: HttpService) {}

  async kakaoLogin(REST_API_KEY: string, REDIRECT_URI: string, code: string) {
    const config = {
      grant_type: 'authorization_code',
      client_id: REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      code,
    };
    const params = new URLSearchParams(config).toString();
    const tokenHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const tokenUrl = `https://kauth.kakao.com/oauth/token?${params}`;

    const tokenResponse = await firstValueFrom(
      this.http.post(tokenUrl, '', { headers: tokenHeaders }),
    );

    const accessToken = tokenResponse.data.access_token;

    // 사용자 정보 요청
    const userInfoResponse = await firstValueFrom(
      this.http.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    console.log(userInfoResponse.data);
    return userInfoResponse.data; // 사용자 데이터 반환
  }
}
