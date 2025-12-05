import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RmqService } from '../../../packages/common/dist/rmq/rmq.service';
import { RmqModule, RmqPublisher } from '@repo/common';
import { CommentService } from './comment/comment.service';
import { CommentRepository } from './comment/comment.repository';
import { UserProfileRepository } from './user-profile/user-profile.repository';
import { UserProfileService } from './user-profile/user-profile.service';
import { TwitRepository } from './twit/twit.repository';
import { TwitService } from './twit/twit.service';
import { TwitController } from './twit/twit.controller';
import { UserProfileController } from './user-profile/user-profile.controller';
import { CommentController } from './comment/comment.controller';

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
    RmqModule.register({ name: 'TWIT' }),
  ],
  controllers: [TwitController, UserProfileController, CommentController],
  providers: [
    TwitService,
    TwitRepository,

    UserProfileService,
    UserProfileRepository,

    CommentService,
    CommentRepository,

    RmqService,
    RmqPublisher,
  ],
  exports: [
    TwitRepository,
    TwitService,

    UserProfileService,
    UserProfileRepository,

    CommentRepository,
    CommentService,
  ],
})
export class TwitMicroModule {}
