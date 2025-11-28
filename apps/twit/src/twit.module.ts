import { Module } from '@nestjs/common';
import { TwitController } from './twit.controller';
import { TwitService } from './twit.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@repo/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV;
        switch (env) {
          case 'local':
            return ['../../.env'];
          case 'test':
            return ['../../.env.test'];
          default:
            return ['../../.env'];
        }
      })(),
    }),
    RmqModule.register({ name: 'TWIT' }),
  ],
  controllers: [TwitController],
  providers: [TwitService],
})
export class TwitModule {}
