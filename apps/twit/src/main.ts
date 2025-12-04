import { NestFactory } from '@nestjs/core';
import { TwitMicroModule } from './twit-micro.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@repo/common';
import { setupRabbitMQ } from '@repo/common';
import { RABBITMQ_EXCHANGE } from '@repo/common';

async function bootstrap() {
  const app = await NestFactory.create(TwitMicroModule);

  const rmqService = app.get<RmqService>(RmqService);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('TWIT_SERVICE_PORT');

  const RMQ_URL = configService.get('RABBITMQ_URL');
  const QUEUE_NAME = configService.get('RABBITMQ_TWIT_QUEUE');
  const ROUTING_KEY_USER = 'user.#';
  const ROUTING_KEY_TWIT = 'twit.#';

  await setupRabbitMQ(RMQ_URL, QUEUE_NAME, RABBITMQ_EXCHANGE, ROUTING_KEY_TWIT);
  await setupRabbitMQ(RMQ_URL, QUEUE_NAME, RABBITMQ_EXCHANGE, ROUTING_KEY_USER);

  // 'TWIT'를 넣으면 내부적으로 RABBITMQ_TWIT_QUEUE 환경변수 값을 큐 이름으로 사용합니다.
  // noAck: false로 설정하여 수동 ACK 모드를 사용합니다 (안정성 확보).
  app.connectMicroservice(rmqService.getOptions('TWIT', false));

  await app.startAllMicroservices();

  // 5. HTTP 서버 시작 (헬스 체크 등을 위해 필요)
  await app.listen(port);
  console.log(
    `🚀port:${port} [Twit] 서비스가 실행되었습니다! (Queue: ${QUEUE_NAME})`,
  );
}
bootstrap();
