import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices"; // ★ 통신을 위한 모듈
import { ConfigModule, ConfigService } from "@nestjs/config"; // ★ 환경변수 모듈
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),
    ClientsModule.registerAsync([
      {
        name: "AUTH_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get<string>("RABBITMQ_URL")}`],
            queue: "auth_queue",
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: "TWIT_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get<string>("RABBITMQ_URL")}`],
            queue: "tweet_queue",
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: "NOTIFICATION_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get<string>("RABBITMQ_URL")}`],
            queue: "notification_queue",
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
