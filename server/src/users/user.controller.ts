import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('phoneNumber') phoneNumber: string,
    @Body('studentId') studentId: string,
  ): Promise<User> {
    return this.usersService.createUser(name, phoneNumber, studentId);
  }

  @Get(':phoneNumber')
  async findUser(@Param('phoneNumber') phoneNumber: string): Promise<User | undefined> {
    return this.usersService.findUserByPhoneNumber(phoneNumber);
  }
}
