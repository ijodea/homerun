import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'student_id', nullable: false })
  studentId: string;

  @Column({ name: 'phone_number', nullable: false })
  phoneNumber: string;

  @BeforeInsert()
  async hashSensitiveData() {
    // 전화번호와 학번을 해시합니다.
    this.studentId = await bcrypt.hash(this.studentId, 10);
    this.phoneNumber = await bcrypt.hash(this.phoneNumber, 10);
  }
}
