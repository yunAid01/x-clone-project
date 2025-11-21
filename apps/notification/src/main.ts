import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const RMQ_URL = configService.get<string>("RABBITMQ_URL");

  // Notification 서비스 생성
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${RMQ_URL}`],
        queue: "notification_queue", // 👈 여기 이름이 notification_queue 입니다!
        queueOptions: {
          durable: false,
        },
        socketOptions: {
          clientProperties: {
            connection_name: "Notification Service (Worker)", // 관리자 페이지에 뜰 이름
          },
        },
      },
    }
  );

  await app.listen();
  console.log(
    `[Notification] 서비스가 실행되었습니다! (Queue: notification_queue)`
  );
  await appContext.close();
}
bootstrap();
