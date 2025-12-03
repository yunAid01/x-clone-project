import { DynamicModule, Module } from '@nestjs/common';
import { RmqService } from './rmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 예시: 공통으로 사용하는 RabbitMQ 모듈
interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
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
        ClientsModule.registerAsync([
          {
            name, // 'USER', 'TWIT', 'AUTH' 등
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get('RABBITMQ_URL')],
                queue: configService.get(`RABBITMQ_${name}_QUEUE`),
                queueOptions: {
                  durable: true,
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
