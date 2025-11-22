import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  @MessagePattern({ cmd: 'send_notice' })
  sendNotice(data: any) {
    return {
      status: 'success',
      message: `Notification sent successfully.`,
      receivedData: data,
    };
  }
}
