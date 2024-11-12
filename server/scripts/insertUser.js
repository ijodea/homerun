const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function insertUser() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '0510',
    port: 5432,
  });

  await client.connect();

  const name = '박영찬';
  const phoneNumber = '01047522964';
  const studentId = '60205152';

  const hashedPhoneNumber = await bcrypt.hash(phoneNumber, 10);
  const hashedStudentId = await bcrypt.hash(studentId, 10);

  const query = `
    INSERT INTO users (name, student_id, phone_number)
    VALUES ($1, $2, $3)
  `;

  await client.query(query, [name, hashedStudentId, hashedPhoneNumber]);

  console.log('User inserted successfully');
  await client.end();
}

insertUser().catch(console.error);