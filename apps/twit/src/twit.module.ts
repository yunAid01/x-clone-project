import { Module } from '@nestjs/common';
import { AppController } from './twit.controller';
import { AppService } from './twit.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TwitModule {}
