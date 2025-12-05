import { Controller, Logger, UseFilters } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CommentService } from './comment.service';
import { FitRpcExceptionFilter, RmqService } from '@repo/common';

@Controller()
@UseFilters(new FitRpcExceptionFilter())
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(
    private readonly commentService: CommentService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('createComment')
  async createComment(
    @Ctx() context: RmqContext,
    @Payload()
    data: {
      twitId: string;
      userId: string;
      content: string;
      parentId?: string;
    },
  ) {
    this.logger.log('💬 [Comments] 댓글 생성 요청받음');
    const newComment = await this.commentService.createComment(
      data.twitId,
      data.userId,
      data.content,
      data?.parentId,
    );
    this.rmqService.ack(context);
    return newComment;
  }

  /** focus one comment */
  @MessagePattern('getComment')
  async getComment(
    @Ctx() context: RmqContext,
    @Payload() data: { commentId: string },
  ) {
    this.logger.log(`💬 [Comments] 댓글 상세 요청받음: ${data.commentId}`);
    const comment = await this.commentService.getCommentById(data.commentId);
    this.rmqService.ack(context);
    return comment;
  }

  /** twit's all comments */
  @MessagePattern('getTwitComments')
  async getCommentsByTwit(
    @Ctx() context: RmqContext,
    @Payload() data: { twitId: string },
  ) {
    this.logger.log(`💬 [Comments] 트윗의 댓글 목록 요청받음: ${data.twitId}`);
    const comments = await this.commentService.getCommentsByTwitId(data.twitId);
    this.rmqService.ack(context);
    return comments;
  }

  @MessagePattern('updateComment')
  async updateComment(
    @Ctx() context: RmqContext,
    @Payload() data: { commentId: string; content: string; userId: string },
  ) {
    this.logger.log(`💬 [Comments] 댓글 수정 요청받음: ${data.commentId}`);
    const updatedComment = await this.commentService.updateComment(
      data.commentId,
      data.content,
      data.userId,
    );
    this.rmqService.ack(context);
    return updatedComment;
  }

  @MessagePattern('deleteComment')
  async deleteComment(
    @Ctx() context: RmqContext,
    @Payload() data: { commentId: string },
  ) {
    this.logger.log(`💬 [Comments] 댓글 삭제 요청받음: ${data.commentId}`);
    const deletedComment = await this.commentService.deleteComment(
      data.commentId,
    );
    this.rmqService.ack(context);
    return deletedComment;
  }
}
