import { NestFactory } from '@nestjs/core';
import { TwitModule } from './twit.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(TwitModule);
  const configService = appContext.get(ConfigService);
  const RMQ_URL = configService.get<string>('RABBITMQ_URL');

  // Tweet 서비스 생성
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TwitModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${RMQ_URL}`],
        queue: 'tweet_queue',
        queueOptions: {
          durable: false,
        },
        socketOptions: {
          clientProperties: {
            connection_name: 'Tweet Service (Worker)', // 관리자 페이지에 뜰 이름
          },
        },
      },
    },
  );

  await app.listen();
  console.log(`[Tweet] 서비스가 실행되었습니다! (Queue: tweet_queue)`);
  await appContext.close();
}
bootstrap();
