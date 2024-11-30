import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TaxiModule } from 'src/taxi/taxi.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TaxiModule],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
