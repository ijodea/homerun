import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { BusService } from '../bus/bus.service';
import { ShuttleService } from '../shuttle/shuttle.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TransportService, BusService, ShuttleService],
  controllers: [],
  exports: [TransportService],
})
export class TransportModule {}
