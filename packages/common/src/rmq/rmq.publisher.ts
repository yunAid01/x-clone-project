import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RABBITMQ_EXCHANGE } from '../constant/constant'; // 👈 상수 import

@Injectable()
export class RmqPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RmqPublisher.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // 교환소(Exchange) 확인 (없으면 생성)
      await this.channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', {
        durable: true,
      });

      this.logger.log('🔌 RabbitMQ Publisher 연결 완료');
    } catch (error) {
      this.logger.error(`❌ RabbitMQ 연결 실패: ${error}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('🔌 RabbitMQ Publisher 연결 종료');
    } catch (error) {
      this.logger.error(`❌ 연결 종료 중 에러: ${error}`);
    }
  }

  /**
   * 이벤트를 발행합니다.
   * @param pattern 메시지 패턴 (예: 'user.created')
   * @param data 전송할 데이터
   */
  publish(pattern: string, data: any) {
    if (!this.channel) {
      this.logger.error('❌ 채널이 초기화되지 않았습니다.');
      return;
    }

    const message = JSON.stringify({ pattern, data });

    // Buffer 변환 후 발행
    this.channel.publish(RABBITMQ_EXCHANGE, pattern, Buffer.from(message));
    this.logger.debug(`📢 이벤트 발행: ${pattern}`);
  }
}
