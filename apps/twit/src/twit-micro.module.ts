import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule, RmqPublisher } from '@repo/common';
import { PrismaModule } from './prisma/prisma.module';
import { TwitModule } from './twit/twit.module';
import { UserProfileModule } from './user-profile/user-profile.module';

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
    PrismaModule,
    TwitModule,
    UserProfileModule,
  ],
  providers: [RmqPublisher],
})
export class TwitMicroModule {}
