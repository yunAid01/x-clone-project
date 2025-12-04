import { Controller, Get, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@repo/common';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern({ cmd: 'send_notice' })
  sendNotice(data: any) {
    return {
      status: 'success',
      message: `Notification sent successfully.`,
      receivedData: data,
    };
  }

  // 👇 user.created 이벤트 구독
  @EventPattern('user.created')
  async handleUserCreated(
    @Payload() data: { userId: string; email: string; nickname: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`🔔 새 사용자 가입 알림: ${data.nickname} (${data.email})`);
      // TODO: 실제 알림 발송 로직 (이메일, 푸시 등)
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context);
    }
  }

  // 👇 twit.created 이벤트 구독
  @EventPattern('twit.created')
  async handleTwitCreated(
    @Payload() data: { twitId: string; userId: string; content: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`🔔 새 트윗 알림: ${data.content.substring(0, 20)}...`);
      // TODO: 팔로워들에게 알림 발송
      this.rmqService.ack(context);
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context);
    }
  }
}
