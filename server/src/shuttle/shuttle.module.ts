import { Module } from '@nestjs/common';
import { ShuttleController } from './shuttle.controller';
import { ShuttleService } from './shuttle.service';

@Module({
  controllers: [ShuttleController],
  providers: [ShuttleService],
})
export class ShuttleModule {}
