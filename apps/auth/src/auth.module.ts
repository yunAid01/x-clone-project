import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

import { FitRpcExceptionFilter, RmqModule, RmqPublisher } from '@repo/common';
import { AuthRepository } from './auth.repository';
import { APP_FILTER } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV;
        switch (env) {
          case 'local':
            return ['../../.env.local'];
          case 'test':
            return ['../../.env.test'];
          case 'production':
            return ['../../.env.production'];
          default:
            return ['../../.env.local'];
        }
      })(),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    RmqModule.register({ name: 'AUTH' }),
    RmqModule.register({ name: 'USER' }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RmqPublisher,
    AuthRepository,
    // APP_FILTER는 마이크로서비스에서 작동하지 않음 - main.ts에서 useGlobalFilters로 등록
  ],
})
export class AuthModule {}
