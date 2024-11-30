import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 사용자 생성
  async createUser(
    name: string,
    phoneNumber: string,
    studentId: string,
  ): Promise<User> {
    this.logger.debug(`
      ===== 새 사용자 생성 시도 =====
      - 이름: ${name}
      - 전화번호: ${phoneNumber}
      - 학번: ${studentId}
    `);

    try {
      // 중복 검사
      const existingUser = await this.findUserByPhoneNumber(phoneNumber);
      if (existingUser) {
        this.logger.warn('이미 등록된 전화번호입니다.');
        throw new ConflictException('이미 등록된 전화번호입니다.');
      }

      // 새 사용자 생성
      const user = new User();
      user.name = name;
      user.phoneNumber = phoneNumber;
      user.studentId = studentId;

      const savedUser = await this.usersRepository.save(user);
      this.logger.debug(`✅ 사용자 생성 성공 (ID: ${savedUser.id})`);
      return savedUser;
    } catch (error) {
      this.logger.error(`❌ 사용자 생성 실패: ${error.message}`);
      throw error;
    }
  }

  // 전화번호로 사용자 찾기
  async findUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    this.logger.debug(`
      ===== 전화번호로 사용자 검색 =====
      검색할 전화번호: ${phoneNumber}
    `);

    try {
      const users = await this.usersRepository.find();
      this.logger.debug(`검색된 총 사용자 수: ${users.length}`);

      //각 사용자의 해시된 전화번호와 비교
      for (const user of users) {
        const isMatch = await bcrypt.compare(phoneNumber, user.phoneNumber);
        if (isMatch) {
          return user;
        }
      }

      return undefined; // 일치하는 사용자가 없는 경우
    } catch (error) {
      this.logger.error(`❌ 사용자 검색 중 오류: ${error.message}`);
      throw error;
    }
  }

  // 사용자 검증
  async validateUser(
    name: string,
    studentId: string,
    phoneNumber: string,
  ): Promise<boolean> {
    this.logger.debug(`
      ===== 사용자 검증 시작 =====
      입력된 정보:
      - 이름: ${name}
      - 학번: ${studentId}
      - 전화번호: ${phoneNumber}
    `);

    try {
      // 1. 모든 사용자 조회
      const allUsers = await this.usersRepository.find();
      this.logger.debug(`검색된 총 사용자 수: ${allUsers.length}`);

      // 2. 각 사용자에 대해 검증
      for (const user of allUsers) {
        try {
          const isNameValid = user.name === name;
          const isStudentIdValid = await bcrypt.compare(
            studentId,
            user.studentId,
          );
          const isPhoneValid = await bcrypt.compare(
            phoneNumber,
            user.phoneNumber,
          );

          this.logger.debug(`
            검증 결과 (사용자 ID: ${user.id}):
            - 이름 일치: ${isNameValid}
            - 학번 일치: ${isStudentIdValid}
            - 전화번호 일치: ${isPhoneValid}
            - DB 저장 정보:
              · 이름: ${user.name}
              · 학번: ${user.studentId.substring(0, 10)}...
              · 전화번호: ${user.phoneNumber.substring(0, 10)}...
          `);

          if (isNameValid && isStudentIdValid && isPhoneValid) {
            this.logger.debug('✅ 사용자 검증 성공');
            return true;
          }
        } catch (error) {
          this.logger.error(`해당 사용자 검증 중 오류: ${error.message}`);
          continue; // 다음 사용자 검증
        }
      }

      this.logger.warn('❌ 일치하는 사용자를 찾을 수 없음');
      return false;
    } catch (error) {
      this.logger.error(`❌ 검증 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  // 사용자 정보 업데이트
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    this.logger.debug(`
      ===== 사용자 정보 업데이트 =====
      사용자 ID: ${id}
      업데이트 데이터: ${JSON.stringify(updateData)}
    `);

    try {
      await this.usersRepository.update(id, updateData);
      const updatedUser = await this.usersRepository.findOne({ where: { id } });
      this.logger.debug('✅ 사용자 정보 업데이트 성공');
      return updatedUser;
    } catch (error) {
      this.logger.error(`❌ 사용자 정보 업데이트 실패: ${error.message}`);
      throw error;
    }
  }
}
