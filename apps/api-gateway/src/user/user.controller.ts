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

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  getUserProfile(@Param('id') id: string) {
    console.log('🚀 [Gateway] User 서비스로 getUser 신호를 보냅니다...');
    return this.userClient.send('getUser', { id });
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserData: any) {
    console.log('🚀 [Gateway] User 서비스로 updateUser 신호를 보냅니다...');
    return this.userClient.send('updateUser', { id, ...updateUserData });
  }

  @Post(':targetUserId/follow')
  followUser(
    @Param('targetUserId') targetUserId: string,
    @User() user: { userId: string; email: string },
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
    @User() user: { userId: string; email: string },
  ) {
    console.log('🚀 [Gateway] User 서비스로 unfollowUser 신호를 보냅니다...');
    return this.userClient.send('unfollowUser', {
      userId: user.userId,
      targetUserId,
    });
  }
}
