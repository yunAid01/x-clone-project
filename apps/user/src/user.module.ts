import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqModule } from '@repo/common';
import { UserProfileRepository } from './userprofile.reposigory';
import { UserFollowRepository } from './userfollow.repository';

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
    RmqModule.register({ name: 'USER' }),
    PrismaModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserProfileRepository, UserFollowRepository],
})
export class UserModule {}
