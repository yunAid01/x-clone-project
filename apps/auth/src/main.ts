import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  // 먼저 앱 컨텍스트(껍데기)를 만듭니다. (ConfigService를 꺼내기 위해)
  // createApplicationContext는 서버를 띄우진 않고 Nest 기능만 로드합니다.
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const R_USER = configService.get<string>("RABBITMQ_USER");
  const R_PASS = configService.get<string>("RABBITMQ_PASSWORD");
  const R_HOST = configService.get<string>("RABBITMQ_HOST");
  const R_PORT = configService.get<string>("RABBITMQ_PORT");

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${R_USER}:${R_PASS}@${R_HOST}:${R_PORT}`],
        queue: "auth_queue",
        queueOptions: {
          durable: false,
        },
      },
    }
  );
  await app.listen();
  console.log(`🔐 Auth Microservice is running on ${R_HOST}:${R_PORT}`);
  await appContext.close();
}
bootstrap();
