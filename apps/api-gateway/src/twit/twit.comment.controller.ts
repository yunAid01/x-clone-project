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
  Patch,
  Delete,
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
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(@Inject('TWIT') private readonly twitClient: ClientProxy) {}

  @Get(':twitId/comments')
  @UseInterceptors(CacheInterceptor)
  getTwitComments(@Param('twitId') twitId: string) {
    this.logger.log(
      '🚀 [Gateway] Twit 서비스로 getTwitComments 신호를 보냅니다...',
    );
    return this.twitClient.send('getTwitComments', { twitId });
  }

  @Post(':twitId/comment')
  createComment(
    @Param('twitId') twitId: string,
    @Body() data: { content: string; parentId?: string },
    @User() user: AuthenticatedUser,
  ) {
    this.logger.log(
      '🚀 [Gateway] Twit 서비스로 createComment 신호를 보냅니다...',
    );
    return this.twitClient.send('createComment', {
      twitId: twitId,
      content: data.content,
      userId: user.userId,
      parentId: data.parentId,
    });
  }

  @Patch(':twitId/comment/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() data: { content: string },
    @User() user: AuthenticatedUser,
  ) {
    this.logger.log(
      '🚀 [Gateway] Twit 서비스로 updateComment 신호를 보냅니다...',
    );
    return this.twitClient.send('updateComment', {
      commentId: commentId,
      content: data.content,
      userId: user.userId,
    });
  }

  @Delete(':twitId/comment/:commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @User() user: AuthenticatedUser,
  ) {
    this.logger.log(
      '🚀 [Gateway] Twit 서비스로 deleteComment 신호를 보냅니다...',
    );
    return this.twitClient.send('deleteComment', {
      commentId: commentId,
      userId: user.userId,
    });
  }
}
