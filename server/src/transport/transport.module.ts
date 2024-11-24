import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { BusService } from '../bus/bus.service';
import { ShuttleService } from '../shuttle/shuttle.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TransportService, BusService, ShuttleService],
  controllers: [TransportController],
  exports: [TransportService],
})
export class TransportModule {}
