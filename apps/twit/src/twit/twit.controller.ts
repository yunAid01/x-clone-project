import { Controller, Logger, UseFilters } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { TwitService } from './twit.service';
import { FitRpcExceptionFilter, RmqService } from '@repo/common';

@Controller()
@UseFilters(new FitRpcExceptionFilter())
export class TwitController {
  private readonly logger = new Logger(TwitController.name);

  constructor(
    private readonly twitService: TwitService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('createTwit')
  async createTwit(
    @Ctx() context: RmqContext,
    @Payload() data: { content: string; userId: string },
  ) {
    this.logger.log('🐦 [Twits] 트윗 생성 요청받음');
    this.logger.log(`Content: ${data.content}, UserID: ${data.userId}`);
    const newTwit = await this.twitService.createTwit(
      data.content,
      data.userId,
    );
    this.rmqService.ack(context);
    return newTwit;
  }

  @MessagePattern('updateTwit')
  async updateTwit(
    @Ctx() context: RmqContext,
    @Payload() data: { userId: string; twitId: string; content: string },
  ) {
    this.logger.log('🐦 [Twits] 트윗 수정 요청받음');
    const updatedTwit = await this.twitService.updateTwit(
      data.userId,
      data.twitId,
      data.content,
    );
    this.rmqService.ack(context);
    return updatedTwit;
  }

  @MessagePattern('deleteTwit')
  async deleteTwit(
    @Ctx() context: RmqContext,
    @Payload() data: { userId: string; twitId: string },
  ) {
    this.logger.log('🐦 [Twits] 트윗 삭제 요청받음');
    const deleteResult = await this.twitService.deleteTwit(
      data.userId,
      data.twitId,
    );
    this.rmqService.ack(context);
    return deleteResult;
  }

  @MessagePattern('getTwit')
  async getTwitDetail(
    @Ctx() context: RmqContext,
    @Payload() data: { twitId: string },
  ) {
    this.logger.log(`🐦 [Twits] 트윗 상세 요청받음: ${data.twitId}`);
    const twit = await this.twitService.getTwitById(data.twitId);
    this.rmqService.ack(context);
    return twit;
  }

  @MessagePattern('getTwits')
  async getTwits(@Ctx() context: RmqContext) {
    this.logger.log('🐦 [Twits] 트윗 목록 요청받음');
    const twits = await this.twitService.getTwits();
    this.rmqService.ack(context);
    return twits;
  }
}
