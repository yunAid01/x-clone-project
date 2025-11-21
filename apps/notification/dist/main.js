"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const appContext = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const configService = appContext.get(config_1.ConfigService);
    const RMQ_URL = configService.get("RABBITMQ_URL");
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [`${RMQ_URL}`],
            queue: "notification_queue",
            queueOptions: {
                durable: false,
            },
            socketOptions: {
                clientProperties: {
                    connection_name: "Notification Service (Worker)",
                },
            },
        },
    });
    await app.listen();
    console.log(`[Notification] 서비스가 실행되었습니다! (Queue: notification_queue)`);
    await appContext.close();
}
bootstrap();
//# sourceMappingURL=main.js.map