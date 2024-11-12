import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  studentId: string;

  @BeforeInsert()
  async hashSensitiveData() {
    // 전화번호와 학번을 해시합니다.
    this.phoneNumber = await bcrypt.hash(this.phoneNumber, 10);
    this.studentId = await bcrypt.hash(this.studentId, 10);
  }
}
