import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('name') name: string,
    @Body('studentId') studentId: string,
    @Body('phoneNumber') phoneNumber: string,
  
  ) {
    this.logger.debug(`Login request received - Name: ${name}, StudentID: ${studentId}, Phone: ${phoneNumber}`);
    return this.authService.login(name, studentId, phoneNumber);
  }
}
