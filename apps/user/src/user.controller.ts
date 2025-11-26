import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'getUser' })
  getUserProfile(id: string) {
    return this.userService.getUserProfile(id);
  }

  @MessagePattern({ cmd: 'updateUser' })
  updateUser(data: any) {
    return this.userService.updateUserProfile(data);
  }

  @MessagePattern({ cmd: 'followUser' })
  followUser(data: any) {
    return this.userService.followUser(data.userId, data.targetUserId);
  }

  @MessagePattern({ cmd: 'unfollowUser' })
  unfollowUser(data: any) {
    return this.userService.unfollowUser(data.userId, data.targetUserId);
  }
}
