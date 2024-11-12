import { Injectable, UnauthorizedException,Logger} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // 로그인 로직
  async login(name: string, phoneNumber: string, studentId: string) {
    this.logger.log(`로그인 시도: ${name}, ${studentId}, ${phoneNumber}`);
    const isUserValid = await this.usersService.validateUser(name, studentId, phoneNumber);
    if (!isUserValid) {
      this.logger.warn('로그인 실패: 유효하지 않은 사용자 정보');
      throw new UnauthorizedException('로그인 실패: 이름, 전화번호, 학번을 확인하세요.');
    }

    // 사용자 인증 성공 시 JWT 토큰 발급
    const payload = { name, studentId, phoneNumber };
    const token = this.jwtService.sign(payload);
    this.logger.log('로그인 성공: JWT 토큰 발급 완료');
    return {
      access_token: token,
    };
  }
}
