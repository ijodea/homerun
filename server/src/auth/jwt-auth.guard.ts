import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//인증이 필요한 엔드포인터에서 사용할 jwt인증 가드
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
