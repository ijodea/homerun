import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // 로그인 로직
  async login(name: string, phoneNumber: string, studentId: string) {
    const isUserValid = await this.usersService.validateUser(name, phoneNumber, studentId);
    if (!isUserValid) {
      throw new UnauthorizedException('로그인 실패: 이름, 전화번호, 학번을 확인하세요.');
    }

    // 사용자 인증 성공 시 JWT 토큰 발급
    const payload = { name, phoneNumber, studentId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
