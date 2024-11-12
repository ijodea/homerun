import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TaxiModule } from 'src/taxi/taxi.module';

@Module({
  imports: [TaxiModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
