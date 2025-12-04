import { Module } from '@nestjs/common';
import { TwitController } from './twit.controller';
import { TwitService } from './twit.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule, RmqPublisher } from '@repo/common';
import { PrismaModule } from './prisma/prisma.module';
import { TwitRepository } from './twit.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV;
        switch (env) {
          case 'local':
            return ['../../.env.local'];
          case 'test':
            return ['../../.env.test'];
          case 'production':
            return ['../../.env.production'];
          default:
            return ['../../.env.local'];
        }
      })(),
    }),
    RmqModule.register({ name: 'TWIT' }),
    PrismaModule,
  ],
  controllers: [TwitController],
  providers: [TwitService, RmqPublisher, TwitRepository],
})
export class TwitModule {}
