import { Controller, Logger, UseFilters } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserProfileService } from './user-profile.service';
import { FitRpcExceptionFilter, RmqService } from '@repo/common';
import { TwitService } from '../twit/twit.service';
import { CommentService } from '../comment/comment.service';

@Controller()
@UseFilters(new FitRpcExceptionFilter())
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly twitService: TwitService,
    private readonly commentService: CommentService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('user.created')
  async duplicateUserProfile(
    @Payload() data: { userId: string; email: string; nickname: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `[Twit] 새 사용자 프로필 복제: nickname: ${data.nickname} id: (${data.userId})`,
    );
    await this.userProfileService.duplicateUserProfile(data);
    this.rmqService.ack(context);
  }

  @EventPattern('user.updated')
  async handleUserUpdated(
    @Payload() data: { userId: string; nickname?: string; avatarUrl?: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`[Twit] 사용자 프로필 업데이트: userId: ${data.userId}`);

    // 1. UserProfile 복제본 업데이트
    await this.userProfileService.updateUserProfile(data);

    // 2. Twit의 작성자 정보도 업데이트 (내부 호출)
    await this.twitService.updateAuthorInfoInTwits(data.userId, data);

    // 3. Comment의 작성자 정보도 업데이트 (내부 호출)
    await this.commentService.updateAuthorInfoInComments(data.userId, data);

    this.rmqService.ack(context); // ACK는 한 번만
  }
}
