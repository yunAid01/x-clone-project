import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib'; // 👈 amqplib 직접 사용 (이미 설치되어 있음)

// 🐰 RabbitMQ 설정을 강제로 맞춰주는 함수
async function setupRabbitMQ(
  url: string,
  queue: string,
  exchange: string,
  routingKey: string,
) {
  console.log(`🐰 [RabbitMQ Setup] ${queue}를 ${exchange}에 바인딩 중...`);
  try {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    // 1. 교환소(Exchange)가 없으면 만듭니다. (Topic 타입 추천)
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // 2. 큐(Queue)가 없으면 만듭니다. (NestJS 설정과 맞춰야 함)
    await channel.assertQueue(queue, { durable: false }); // durable은 main.ts 설정과 동일하게!

    // 3. ★ 핵심: 큐와 교환소를 연결(Bind)합니다.
    await channel.bindQueue(queue, exchange, routingKey);

    console.log(`✅ [RabbitMQ Setup] 바인딩 성공! (${queue} <--> ${exchange})`);
    await connection.close();
  } catch (error) {
    console.error('❌ [RabbitMQ Setup] 에러 발생:', error);
  }
}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(UserModule);
  const configService = appContext.get(ConfigService);
  const RMQ_URL = configService.get('RABBITMQ_URL');

  // 👇 서비스 이름과 교환소 이름 설정 (원하는 이름으로 변경 가능)
  const QUEUE_NAME = 'user_queue';
  const EXCHANGE_NAME = 'x_clone_exchange'; // 사용하려는 교환소 이름
  const ROUTING_KEY = 'user.#'; // user로 시작하는 모든 메시지를 받음

  // 1. 서버 시작 전에 바인딩부터 확실하게 맺기!
  await setupRabbitMQ(RMQ_URL, QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

  // 2. 마이크로서비스 실행
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${RMQ_URL}`],
        queue: QUEUE_NAME,
        queueOptions: {
          durable: false, // 위 setupRabbitMQ와 맞춰주세요
        },
        socketOptions: {
          clientProperties: {
            connection_name: 'User Service (Worker)',
          },
        },
      },
    },
  );

  await app.listen();
  console.log(`[User] 서비스가 실행되었습니다! (Queue: ${QUEUE_NAME})`);
  await appContext.close();
}
bootstrap();
