import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { TwitService } from './twit.service';
import { RmqService } from '@repo/common';

@Controller()
export class TwitController {
  private readonly logger = new Logger(TwitController.name);

  constructor(
    private readonly twitService: TwitService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('getTwits')
  async getTwits(@Ctx() context: RmqContext) {
    try {
      this.logger.log('🐦 [Twits] 트윗 목록 요청받음');
      const twits = await this.twitService.getTwits();
      this.rmqService.ack(context);
      return twits;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context);
    }
  }

  @MessagePattern('createTwit')
  async createTwit(
    @Ctx() context: RmqContext,
    @Payload() data: { content: string; userId: string },
  ) {
    try {
      this.logger.log('🐦 [Twits] 트윗 생성 요청받음');
      this.logger.log(`Content: ${data.content}, UserID: ${data.userId}`);
      const newTwit = await this.twitService.createTwit(
        data.content,
        data.userId,
      );
      this.rmqService.ack(context);
      return newTwit;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context);
    }
  }
}
