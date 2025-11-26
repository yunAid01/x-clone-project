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
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';
// DTOs
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';

@Controller('user')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  getUserProfile(@Param('id') id: string) {
    console.log('🚀 [Gateway] User 서비스로 getUser 신호를 보냅니다...');
    return this.userClient.send({ cmd: 'getUser' }, { id });
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserData: any) {
    console.log('🚀 [Gateway] User 서비스로 updateUser 신호를 보냅니다...');
    return this.userClient.send(
      { cmd: 'updateUser' },
      { id, ...updateUserData },
    );
  }

  @Post(':id/follow')
  followUser(
    @Param('id') id: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    console.log('🚀 [Gateway] User 서비스로 followUser 신호를 보냅니다...');
    return this.userClient.send(
      { cmd: 'followUser' },
      { userId: id, targetUserId },
    );
  }

  @Post(':id/unfollow')
  unfollowUser(
    @Param('id') id: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    console.log('🚀 [Gateway] User 서비스로 unfollowUser 신호를 보냅니다...');
    return this.userClient.send(
      { cmd: 'unfollowUser' },
      { userId: id, targetUserId },
    );
  }
}
