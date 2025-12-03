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
  async createUserProfile(
    @Payload() data: { userId: string; nickname: string; email: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.userService.createUserProfile(data);
      this.logger.log(`✅ 프로필 생성 완료! User ID: ${data.userId}`);
      this.rmqService.ack(context); // 성공 시 ACK 전송
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`❌ 프로필 생성 실패! User ID: ${data.userId}`);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }

  @MessagePattern('getAllUsers')
  async getAllUsers(@Ctx() context: RmqContext) {
    try {
      const users = await this.userService.getAllUsers();
      this.logger.log(`✅ 모든 사용자 프로필 조회 완료!`);
      this.rmqService.ack(context); // 성공 시 ACK 전송
      return users;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }

  @MessagePattern('getUser')
  async getUserProfile(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      const user = await this.userService.getUserProfile(data.id);
      this.logger.log(`✅ 사용자 프로필 조회 완료! User ID: ${data.id}`);
      this.rmqService.ack(context); // 성공 시 ACK 전송
      return user;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }

  @MessagePattern('updateUser')
  updateUser(@Payload() data: any) {
    return this.userService.updateUserProfile(data);
  }

  @MessagePattern('followUser')
  async followUser(
    @Payload() data: { userId: string; targetUserId: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      const result = await this.userService.followUser(
        data.userId,
        data.targetUserId,
      );
      this.logger.log(
        `✅ User ID: ${data.userId} 가 User ID: ${data.targetUserId} 를 팔로우했습니다.`,
      );
      this.rmqService.ack(context);
      return result;
    } catch (error) {
      this.logger.error(`follow 요청 실패: ${error.message}`);
      this.rmqService.ack(context);
      throw error;
    }
  }

  @MessagePattern('unfollowUser')
  async unfollowUser(
    @Payload() data: { userId: string; targetUserId: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      const result = await this.userService.unfollowUser(
        data.userId,
        data.targetUserId,
      );
      this.logger.log(
        `✅ User ID: ${data.userId} 가 User ID: ${data.targetUserId} 를 언팔로우했습니다.`,
      );
      this.rmqService.ack(context);
      return result;
    } catch (error) {
      this.logger.error(`unfollow 요청 실패: ${error.message}`);
      this.rmqService.ack(context);
      throw error;
    }
  }
}
