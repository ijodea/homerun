import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('name') name: string,
    @Body('studentId') studentId: string,
    @Body('phoneNumber') phoneNumber: string,
  
  ) {
    return this.authService.login(name, studentId, phoneNumber);
  }
}
