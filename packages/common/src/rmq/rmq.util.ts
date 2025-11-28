import * as amqp from 'amqplib';
import { Logger } from '@nestjs/common';

// NestJS Logger를 사용하여 로그를 더 예쁘게 출력하도록 변경했습니다.
const logger = new Logger('RabbitMQSetup');

export async function setupRabbitMQ(
  url: string,
  queue: string,
  exchange: string,
  routingKey: string,
  queueOptions: amqp.Options.AssertQueue = { durable: true }, // 기본값 설정
) {
  logger.log(`🐰 ${queue}를 ${exchange}에 바인딩 준비 중...`);

  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    // 1. 교환소(Exchange) 생성
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // 2. 큐(Queue) 생성
    await channel.assertQueue(queue, queueOptions);

    // 3. 바인딩
    await channel.bindQueue(queue, exchange, routingKey);

    logger.log(`✅ 바인딩 성공! (${queue} <--> ${exchange} :: ${routingKey})`);

    await channel.close();
    await connection.close();
  } catch (error) {
    logger.error(`❌ RabbitMQ 설정 중 에러 발생: ${error}`);
    // 설정 실패 시 앱이 켜지면 안 되므로 에러를 다시 던집니다.
    throw error;
  }
}
