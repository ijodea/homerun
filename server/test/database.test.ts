import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../src/users/user.entity';  // 경로 주의
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config({ path: '.env' });

async function testConnection() {
  const configService = new ConfigService();
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '0510',
    database: process.env.DATABASE_NAME || 'postgres',
    entities: [User],
  });

  try {
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공!');
    
    // 테이블 존재 여부 확인
    const tables = await dataSource.query('SELECT * FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('현재 데이터베이스의 테이블:', tables.map(t => t.table_name));
    
    // User 테이블 데이터 확인
    const users = await dataSource.getRepository(User).find();
    console.log('User 테이블 데이터:', users);
    
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
  } finally {
    await dataSource.destroy();
  }
}

testConnection();