import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { config } from "process";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const RMQ_URL = configService.get<string>("RABBITMQ_URL");

  // Tweet 서비스 생성
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${RMQ_URL}`],
        queue: "tweet_queue", // 👈 여기 이름이 tweet_queue 입니다!
        queueOptions: {
          durable: false,
        },
        socketOptions: {
          clientProperties: {
            connection_name: "Tweet Service (Worker)", // 관리자 페이지에 뜰 이름
          },
        },
      },
    }
  );

  await app.listen();
  console.log(`[Tweet] 서비스가 실행되었습니다! (Queue: tweet_queue)`);
  await appContext.close();
}
bootstrap();
