import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  // 마이크로서비스가 실행될 때 옵션을 가져오는 헬퍼 함수
  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL')!],
        queue: this.configService.get<string>(`RABBITMQ_${queue}_QUEUE`),
        noAck,
        persistent: true,
      },
    };
  }

  // 메시지 처리 후 수동으로 ACK를 날리는 헬퍼 함수
  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
