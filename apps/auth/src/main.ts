import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // 먼저 앱 컨텍스트(껍데기)를 만듭니다. (ConfigService를 꺼내기 위해)
  // createApplicationContext는 서버를 띄우진 않고 Nest 기능만 로드합니다.
  const appContext = await NestFactory.createApplicationContext(AuthModule);
  const configService = appContext.get(ConfigService);
  const RMQ_URL = configService.get('RABBITMQ_URL');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${RMQ_URL}`],
        queue: 'auth_queue',
        queueOptions: {
          durable: false,
        },
        socketOptions: {
          clientProperties: {
            connection_name: 'Auth Service (Worker)', // 관리자 페이지에 뜰 이름
          },
        },
      },
    },
  );
  await app.listen();
  console.log(`[Auth] 서비스가 실행되었습니다! (Queue: auth_queue)`);
  await appContext.close();
}
bootstrap();
