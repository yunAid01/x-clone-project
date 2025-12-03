import { NestFactory } from '@nestjs/core';
import { TwitModule } from './twit.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@repo/common';
import { setupRabbitMQ } from '@repo/common';
import { RABBITMQ_EXCHANGE } from '@repo/common';
// 🐰 RabbitMQ 설정을 강제로 맞춰주는 함수

async function bootstrap() {
  // 1. 하이브리드 앱 패턴 사용
  // createMicroservice 대신 create를 사용하여 HTTP 서버와 마이크로서비스를 동시에 구동합니다.
  // 이렇게 하면 DI 컨테이너에서 ConfigService나 RmqService를 쉽게 꺼낼 수 있습니다.
  const app = await NestFactory.create(TwitModule);

  const rmqService = app.get<RmqService>(RmqService);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('TWIT_SERVICE_PORT');

  // 2. 환경변수 가져오기
  const RMQ_URL = configService.get('RABBITMQ_URL');
  // RmqService는 'RABBITMQ_TWIT_QUEUE' 환경변수를 찾으므로, 여기서도 맞춰줍니다.
  const QUEUE_NAME = configService.get('RABBITMQ_TWIT_QUEUE');
  const ROUTING_KEY = 'twit.#';

  // 3. 서버 시작 전 바인딩 수행
  await setupRabbitMQ(RMQ_URL, QUEUE_NAME, RABBITMQ_EXCHANGE, ROUTING_KEY);

  // 4. 마이크로서비스 연결 (RmqService 활용)
  // 'AUTH'를 넣으면 내부적으로 RABBITMQ_AUTH_QUEUE 환경변수 값을 큐 이름으로 사용합니다.
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
