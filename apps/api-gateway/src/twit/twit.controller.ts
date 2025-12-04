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
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { User } from '@repo/common';

// DTOs
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('twit')
export class TwitController {
  private readonly logger = new Logger(TwitController.name);

  constructor(@Inject('TWIT') private readonly twitClient: ClientProxy) {}

  @Get()
  getTwits() {
    this.logger.log('🚀 [Gateway] Twit 서비스로 getTwits 신호를 보냅니다...');
    return this.twitClient.send('getTwits', {});
  }

  @Post()
  createTwits(
    @Body()
    createTwitData: {
      content: string;
    },
    @User() user: { userId: string; email: string },
  ) {
    this.logger.log(createTwitData.content, user);
    this.logger.log('🚀 [Gateway] Twit 서비스로 createTwit 신호를 보냅니다...');
    return this.twitClient.send('createTwit', {
      content: createTwitData.content,
      userId: user.userId,
    });
  }
}
