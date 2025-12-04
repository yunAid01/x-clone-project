import {
  Controller,
  Inject,
  Post,
  Body,
  HttpException,
  HttpCode,
  Get,
  Param,
  Patch,
  UseInterceptors,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { User } from '@repo/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';
// DTOs
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';
import type { AuthenticatedUser } from '@repo/validation';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  logger = new Logger(UserController.name);

  constructor(@Inject('USER') private readonly userClient: ClientProxy) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  getAllUsers() {
    this.logger.log(
      '🚀 [Gateway] User 서비스로 getAllUsers 신호를 보냅니다...',
    );
    return this.userClient.send('getAllUsers', {});
  }

  @Get(':userId')
  @UseInterceptors(CacheInterceptor)
  getUserProfile(@Param('userId') userId: string) {
    console.log('🚀 [Gateway] User 서비스로 getUser 신호를 보냅니다...');
    return this.userClient.send('getUser', { userId });
  }

  @Patch()
  updateUser(@User() user: AuthenticatedUser, @Body() updateUserData: any) {
    console.log('🚀 [Gateway] User 서비스로 updateUser 신호를 보냅니다...');
    return this.userClient.send('updateUser', {
      userId: user.userId,
      updateUserData: updateUserData,
    });
  }

  @Post(':targetUserId/follow')
  followUser(
    @Param('targetUserId') targetUserId: string,
    @User() user: AuthenticatedUser,
  ) {
    this.logger.log(user);
    this.logger.log('🚀 [Gateway] User 서비스로 followUser 신호를 보냅니다...');
    return this.userClient.send('followUser', {
      userId: user.userId,
      targetUserId: targetUserId,
    });
  }

  @Post(':targetUserId/unfollow')
  unfollowUser(
    @Param('targetUserId') targetUserId: string,
    @User() user: AuthenticatedUser,
  ) {
    console.log('🚀 [Gateway] User 서비스로 unfollowUser 신호를 보냅니다...');
    return this.userClient.send('unfollowUser', {
      userId: user.userId,
      targetUserId,
    });
  }
}
