import { Controller, Logger, UseFilters } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserProfileService } from './user-profile.service';
import { FitRpcExceptionFilter, RmqService, User } from '@repo/common';

@Controller()
@UseFilters(new FitRpcExceptionFilter())
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(
    private readonly userProfileService: UserProfileService,
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
}
