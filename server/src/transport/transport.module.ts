import { Module } from '@nestjs/common';
import { BusModule } from '../bus/bus.module';
import { ShuttleModule } from '../shuttle/shuttle.module';
import { TransportService } from './transport.service';

@Module({
  imports: [BusModule, ShuttleModule],
  providers: [TransportService],
})
export class TransportModule {}
