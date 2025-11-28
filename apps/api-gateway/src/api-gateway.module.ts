import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
// redis cache
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { RmqModule } from '@repo/common';

// validation zod pipe
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV;
        switch (env) {
          case 'local':
            return ['../../.env'];
          case 'test':
            return ['../../.env.test'];
          default:
            return ['../../.env'];
        }
      })(),
    }),
    RmqModule.register({ name: 'AUTH' }),
    RmqModule.register({ name: 'USER' }),
    RmqModule.register({ name: 'TWIT' }),
    RmqModule.register({ name: 'NOTIFICATION' }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: 'localhost',
        port: configService.get('REDIS_PORT'),
        ttl: 600, // 캐시 유지 시간 (초 단위)
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class ApiGateWayModule {}
