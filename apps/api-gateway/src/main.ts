import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4000);
  console.log(`🔐 API-GATEWAY is running on ${4000}`);
}
bootstrap();
