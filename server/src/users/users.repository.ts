import { EntityRepository, Repository } from 'typeorm';
import { User } from './users.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> {}
