import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '0510',
  database: 'postgres',
  entities: [User],
  synchronize: false
});

async function testDatabase() {
  try {
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공!');
    
    // 테이블 존재 여부 확인
    const tables = await dataSource.query('SELECT * FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('현재 데이터베이스의 테이블:', tables.map(t => t.table_name));
    
    // users 테이블 데이터를 직접 SQL로 조회
    const users = await dataSource.query('SELECT * FROM users');
    console.log('Users 테이블 데이터:', users);
    
    // 평문 데이터 삭제
    await dataSource.query('DELETE FROM users WHERE id = 2');
    console.log('평문 데이터 삭제 완료');
    
    // 삭제 후 데이터 다시 확인
    const updatedUsers = await dataSource.query('SELECT * FROM users');
    console.log('업데이트된 Users 테이블 데이터:', updatedUsers);
    
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
  } finally {
    await dataSource.destroy();
  }
}

testDatabase();