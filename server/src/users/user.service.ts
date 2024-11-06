import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 사용자 생성 (중복 확인 포함)
  async createUser(name: string, phoneNumber: string, studentId: string): Promise<User> {
    // 중복 전화번호 확인
    const existingUserByPhone = await this.usersRepository.findOne({
      where: { phoneNumber },
    });
    if (existingUserByPhone) {
      throw new ConflictException('This phone number is already registered.');
    }

    // 중복 학번 확인
    const existingUserByStudentId = await this.usersRepository.findOne({
      where: { studentId },
    });
    if (existingUserByStudentId) {
      throw new ConflictException('This student ID is already registered.');
    }

    const user = this.usersRepository.create({ name, phoneNumber, studentId });
    return this.usersRepository.save(user);
  }

  // 전화번호로 사용자 조회 (로그인 시 사용)
  async findUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  // 전화번호 및 학번 확인 후 사용자 인증
  async validateUser(name: string, phoneNumber: string, studentId: string): Promise<boolean> {
    const user = await this.findUserByPhoneNumber(phoneNumber);
    if (!user) return false;

    const isPhoneValid = await bcrypt.compare(phoneNumber, user.phoneNumber);
    const isStudentIdValid = await bcrypt.compare(studentId, user.studentId);

    return user.name === name && isPhoneValid && isStudentIdValid;
  }
}
