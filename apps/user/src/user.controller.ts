import { Controller, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @EventPattern('user.created')
  async createUserProfile(@Payload() data: any) {
    try {
      console.log('🚀 [User] 이벤트 수신완료..');
      await this.userService.createUserProfile(data);
      this.logger.log(`✅ 프로필 생성 완료! User ID: ${data.userId}`);
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`❌ 프로필 생성 실패! User ID: ${data.userId}`);
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
