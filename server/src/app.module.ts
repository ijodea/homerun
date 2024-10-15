import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ConfigModule} from '@nestjs/config';
import { BusModule } from './bus/bus.module';
import { ShuttleModule } from './shuttle/shuttle.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';




@Module({
  imports: [

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/build'),
    }),
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BusModule,
    ShuttleModule,
  ],
})

export class AppModule {}
