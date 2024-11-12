import { Module } from '@nestjs/common';
import { TaxiController } from './taxi.controller';
import { TaxiService } from './taxi.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TaxiController],
  providers: [TaxiService],
  exports: [TaxiService],
})
export class TaxiModule {}
