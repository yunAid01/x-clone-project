import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RmqService } from '@repo/common';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('user.created')
  async createUserProfile(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      console.log('🚀 [User] 이벤트 수신완료..');
      await this.userService.createUserProfile(data);
      this.logger.log(`✅ 프로필 생성 완료! User ID: ${data.userId}`);
      this.rmqService.ack(context); // 성공 시 ACK 전송
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`❌ 프로필 생성 실패! User ID: ${data.userId}`);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }

  @MessagePattern({ cmd: 'getUser' })
  getUserProfile(@Payload() id: string) {
    return this.userService.getUserProfile(id);
  }

  @MessagePattern({ cmd: 'updateUser' })
  updateUser(@Payload() data: any) {
    return this.userService.updateUserProfile(data);
  }

  @MessagePattern({ cmd: 'followUser' })
  followUser(@Payload() data: any) {
    return this.userService.followUser(data.userId, data.targetUserId);
  }

  @MessagePattern({ cmd: 'unfollowUser' })
  unfollowUser(@Payload() data: any) {
    return this.userService.unfollowUser(data.userId, data.targetUserId);
  }
}
