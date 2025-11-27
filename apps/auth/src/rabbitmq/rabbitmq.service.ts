import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  // 1. 연결 시작
  async onModuleInit() {
    try {
      const url = this.configService.get('RABBITMQ_URL');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // (선택) 교환소가 확실히 있는지 확인 (없으면 앱 켤 때 에러 남)
      await this.channel.assertExchange('x_clone_exchange', 'topic', {
        durable: true,
      });

      console.log('🔌 [RabbitMQService] 연결 및 채널 생성 완료!');
    } catch (error) {
      console.error('❌ [RabbitMQService] 연결 실패:', error);
    }
  }

  // 2. 연결 종료
  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  // 3. 메시지 발행 (공통 함수)
  publish(pattern: string, data: any) {
    if (!this.channel) {
      console.error('❌ [RabbitMQService] 채널이 없습니다.');
      return;
    }

    const exchange = 'x_clone_exchange';
    const message = JSON.stringify({ pattern, data });

    this.channel.publish(exchange, pattern, Buffer.from(message));
    console.log(`📢 [RabbitMQService] 이벤트 발행: ${pattern}`);
  }
}
