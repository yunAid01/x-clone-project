import { NestFactory } from '@nestjs/core';
import { ApiGateWayModule } from './api-gateway.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
// swagger imports
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ApiGateWayModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const corsOrigin = configService.get('CORS_ORIGIN');

  app.enableCors({ origin: corsOrigin });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  // swagger config
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API-GATEWAY API')
      .setDescription('API-GATEWAY API description')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('api-docs', app, cleanupOpenApiDoc(openApiDoc));

  await app.listen(port);
  console.log(`🔐 API-GATEWAY is running on ${port}`);
  console.log(`📚 Swagger is running on ${port}/api-docs`);
}
bootstrap();
