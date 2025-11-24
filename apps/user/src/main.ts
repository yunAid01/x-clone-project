import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(UserModule);
  const configService = appContext.get(ConfigService);
  const RMQ_URL = configService.get<string>('RABBITMQ_URL');

  // Tweet 서비스 생성
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${RMQ_URL}`],
        queue: 'user_queue',
        queueOptions: {
          durable: false,
        },
        socketOptions: {
          clientProperties: {
            connection_name: 'User Service (Worker)', // 관리자 페이지에 뜰 이름
          },
        },
      },
    },
  );

  await app.listen();
  console.log(`[User] 서비스가 실행되었습니다! (Queue: user_queue)`);
  await appContext.close();
}
bootstrap();
