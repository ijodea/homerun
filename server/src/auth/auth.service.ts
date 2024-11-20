import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(name: string, studentId: string, phoneNumber: string) {
    this.logger.log(`로그인 시도: ${name}, ${studentId}`); // phoneNumber는 보안상 로깅하지 않음
    
    const isUserValid = await this.usersService.validateUser(name, studentId, phoneNumber);
    this.logger.debug(`user validation result: ${isUserValid}`);
    
    if (!isUserValid) {
      this.logger.warn('로그인 실패: 유효하지 않은 사용자 정보');
      throw new UnauthorizedException('로그인 실패: 이름, 전화번호, 학번을 확인하세요.');
    }

    const payload: JwtPayload = { name, studentId, phoneNumber };
    const token = this.jwtService.sign(payload);
    
    this.logger.log(`로그인 성공: ${name}`);
    return {
      access_token: token,
    };
  }
}