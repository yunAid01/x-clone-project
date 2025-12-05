import { Controller, Logger, UseFilters } from '@nestjs/common';
import { UserService } from './user.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  FitRpcExceptionFilter,
  SsagaziPattern,
  RmqService,
  toRpcException,
} from '@repo/common';
import type { RegisterDtoType } from '@repo/validation';

@Controller()
@UseFilters(new FitRpcExceptionFilter())
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly rmqService: RmqService,
  ) {}

  @SsagaziPattern('auth.created', 'user.profile.created.creation_failed', {
    type: 'event',
    serviceName: 'userService',
  })
  async createUserProfile(
    @Payload()
    data: {
      userId: string;
      email: string;
      nickname: string;
    },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`✅ 새 사용자 프로필 생성 요청: ${JSON.stringify(data)}`);
    await this.userService.createUserProfile(data);
    this.logger.log(`✅ 프로필 생성 완료! User ID: ${data.userId}`);
    this.rmqService.ack(context); // 성공 시 ACK 전송
  }

  @SsagaziPattern('updateUser', 'user.profile.update_failed')
  async updateUser(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`✅ 사용자 프로필 수정 요청: ${JSON.stringify(data)}`);
    const result = await this.userService.updateUserProfile(
      data.userId,
      data.updateUserData,
    );
    this.rmqService.ack(context);
    return result;
  }

  @MessagePattern('loginUserProfile')
  async getLoginUserProfile(
    @Payload() data: { userId: string },
    @Ctx() context: RmqContext,
  ) {
    const userProfile = await this.userService.getUserProfile(data.userId);
    this.logger.log(`✅ 로그인시 본인 프로필 조회 User ID: ${data.userId}`);
    this.rmqService.ack(context);
    return userProfile;
  }

  @MessagePattern('getAllUsers')
  async getAllUsers(@Ctx() context: RmqContext) {
    const users = await this.userService.getAllUsers();
    this.logger.log(`✅ 모든 사용자 프로필 조회 완료!`);
    this.rmqService.ack(context);
    return users;
  }

  @MessagePattern('getUser')
  async getUserProfile(
    @Payload() data: { userId: string },
    @Ctx() context: RmqContext,
  ) {
    const user = await this.userService.getUserProfile(data.userId);
    this.logger.log(`✅ 사용자 프로필 조회 완료! User ID: ${data.userId}`);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('followUser')
  async followUser(
    @Payload() data: { userId: string; targetUserId: string },
    @Ctx() context: RmqContext,
  ) {
    const result = await this.userService.followUser(
      data.userId,
      data.targetUserId,
    );
    this.logger.log(
      `✅ User ID: ${data.userId} 가 User ID: ${data.targetUserId} 를 팔로우했습니다.`,
    );
    this.rmqService.ack(context);
    return result;
  }

  @MessagePattern('unfollowUser')
  async unfollowUser(
    @Payload() data: { userId: string; targetUserId: string },
    @Ctx() context: RmqContext,
  ) {
    const result = await this.userService.unfollowUser(
      data.userId,
      data.targetUserId,
    );
    this.logger.log(
      `✅ User ID: ${data.userId} 가 User ID: ${data.targetUserId} 를 언팔로우했습니다.`,
    );
    this.rmqService.ack(context);
    return result;
  }
}
