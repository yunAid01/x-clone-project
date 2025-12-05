import { Module } from '@nestjs/common';
import { TwitController } from './twit/twit.controller';
import { TwitService } from './twit/twit.service';
import { TwitRepository } from './twit/twit.repository';
import { UserProfileController } from './user-profile/user-profile.controller';
import { UserProfileService } from './user-profile/user-profile.service';
import { UserProfileRepository } from './user-profile/user-profile.repository';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentRepository } from './comment/comment.repository';
import { PrismaModule } from './prisma/prisma.module';
import { RmqModule, RmqPublisher, RmqService } from '@repo/common';

@Module({
  imports: [PrismaModule, RmqModule.register({ name: 'TWIT' })],
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
export class TwitModule {}
