import {
  Controller,
  Inject,
  Post,
  Body,
  HttpException,
  HttpCode,
  Get,
  Logger,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { User } from '@repo/common';

// DTOs
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';
import { AuthGuard } from '@nestjs/passport';
import { CacheInterceptor } from '@nestjs/cache-manager';
import type { AuthenticatedUser } from '@repo/validation';
import { CreateTwitDto } from '../dtos/twit,dto';

@UseGuards(AuthGuard('jwt'))
@Controller('twit')
export class TwitController {
  private readonly logger = new Logger(TwitController.name);

  constructor(@Inject('TWIT') private readonly twitClient: ClientProxy) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  getTwits() {
    this.logger.log('🚀 [Gateway] Twit 서비스로 getTwits 신호를 보냅니다...');
    return this.twitClient.send('getTwits', {});
  }

  @Get(':twitId')
  @UseInterceptors(CacheInterceptor)
  getTwitDetail(@Param('twitId') twitId: string) {
    this.logger.log('🚀 [Gateway] Twit 서비스로 getTwit 신호를 보냅니다...');
    return this.twitClient.send('getTwit', { twitId });
  }

  @Post()
  createTwits(
    @Body()
    createTwitData: CreateTwitDto,
    @User() user: AuthenticatedUser,
  ) {
    this.logger.log('🚀 [Gateway] Twit 서비스로 createTwit 신호를 보냅니다...');
    return this.twitClient.send('createTwit', {
      content: createTwitData.content,
      userId: user.userId,
    });
  }
}
