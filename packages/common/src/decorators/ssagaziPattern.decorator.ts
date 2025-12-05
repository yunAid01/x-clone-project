import { Logger, applyDecorators } from '@nestjs/common';
import {
  MessagePattern,
  EventPattern,
  RmqContext,
} from '@nestjs/microservices';

interface SsagaziOptions {
  type?: 'message' | 'event';
  serviceName?: string;
}

export function SsagaziPattern(
  mainPattern: string,
  rollbackPattern: string,
  options: SsagaziOptions = {},
) {
  const { type = 'message', serviceName = 'authService' } = options;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 1. 메인 핸들러에 패턴 적용 (기존 로직)
    if (type === 'event') {
      EventPattern(mainPattern)(target, propertyKey, descriptor);
    } else {
      MessagePattern(mainPattern)(target, propertyKey, descriptor);
    }

    // 2. 롤백 메서드 이름 생성
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const rollbackMethodName = `rollback${capitalize(propertyKey)}`;

    // 3. 롤백 메서드 구현
    // 주의: 람다식(() => {})을 쓰면 this 바인딩이 안 되므로 function() {} 사용
    const rollbackMethod = async function (data: any, context: RmqContext) {
      const logger = new Logger('SsagaziPattern');
      logger.warn(
        `🚨 [Rollback Triggered] Method: ${rollbackMethodName}, Event: ${rollbackPattern}`,
      );

      const serviceInstance = this[serviceName];

      if (
        serviceInstance &&
        typeof serviceInstance[rollbackMethodName] === 'function'
      ) {
        await serviceInstance[rollbackMethodName](data);
      } else {
        logger.error(
          `❌ 서비스(${serviceName})에 롤백 메서드가 없습니다: ${rollbackMethodName}을(를) 구현해주세요.`,
        );
      }

      if (this.rmqService) {
        this.rmqService.ack(context);
      } else {
        logger.warn(
          '⚠️ rmqService가 컨트롤러에 주입되지 않아 ACK를 보낼 수 없습니다.',
        );
      }
    };

    // 4. 컨트롤러 프로토타입에 롤백 메서드 정의 (defineProperty 사용)
    Object.defineProperty(target, rollbackMethodName, {
      value: rollbackMethod,
      writable: true,
      configurable: true,
    });

    // 5. 동적으로 생성된 메서드에 @EventPattern 적용
    // getOwnPropertyDescriptor로 가져온 descriptor에 데코레이터를 적용합니다.
    const rollbackDescriptor = Object.getOwnPropertyDescriptor(
      target,
      rollbackMethodName,
    );

    if (rollbackDescriptor) {
      // EventPattern 데코레이터를 수동으로 호출하여 메타데이터를 심습니다.
      EventPattern(rollbackPattern)(
        target,
        rollbackMethodName,
        rollbackDescriptor,
      );

      // 변경된 descriptor를 다시 정의하여 메타데이터가 반영되도록 합니다.
      Object.defineProperty(target, rollbackMethodName, rollbackDescriptor);
    }
  };
}
