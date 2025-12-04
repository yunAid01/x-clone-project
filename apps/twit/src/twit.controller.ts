import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
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

  @EventPattern('user.created')
  async duplicateUserProfile(
    @Payload() data: { userId: string; email: string; nickname: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(
        `[Twit] 새 사용자 프로필 복제: nickname: ${data.nickname} id: (${data.userId})`,
      );
      await this.twitService.duplicateUserProfile(data);
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error('UserProfile 생성 실패:', error);
      this.rmqService.ack(context);
    }
  }

  @MessagePattern('getTwits')
  async getTwits(@Ctx() context: RmqContext) {
    try {
      this.logger.log('🐦 [Twits] 트윗 목록 요청받음');
      const twits = await this.twitService.getTwits();
      this.rmqService.ack(context);
      return twits;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
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
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }
}
