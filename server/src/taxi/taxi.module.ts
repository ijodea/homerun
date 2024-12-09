import { Module, Global } from '@nestjs/common';
import { TaxiController } from './taxi.controller';
import { TaxiService } from './taxi.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TaxiController],
  providers: [
    {
      provide: 'GROUP_STORAGE',
      useValue: {
        activeGroups: new Map(),
        completedGroups: new Map(),
      },
    },
    TaxiService,
  ],
  exports: [TaxiService, 'GROUP_STORAGE'],
})
export class TaxiModule {}
