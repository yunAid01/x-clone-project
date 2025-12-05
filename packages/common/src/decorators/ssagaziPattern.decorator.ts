import { applyDecorators, SetMetadata, Logger } from '@nestjs/common';
import {
  MessagePattern,
  EventPattern,
  RmqContext,
} from '@nestjs/microservices';

// 1. 롤백 핸들러를 등록하기 위한 메타데이터 키
export const SSAGAZI_ROLLBACK_METADATA = 'SSAGAZI_ROLLBACK';

export function SsagaziPattern(
  commandPattern: string,
  rollbackEventPattern: string,
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const logger = new Logger('SsagaziPattern');

    // 1. 정상 요청 처리 (@MessagePattern 적용)
    // applyDecorators는 클래스 단위나 메서드 단위 전체에 적용할 때 씁니다.
    // 여기서는 Descriptor를 직접 건드리는 게 아니라, 메타데이터를 심는 방식이 더 안전합니다.

    // 기존 메서드에 MessagePattern 적용
    const messageHandler = MessagePattern(commandPattern);
    messageHandler(target, propertyKey, descriptor);

    // 2. 롤백 메서드 이름 생성 (convention: rollback + MethodName)
    // 예: userRegister -> rollbackUserRegister
    const rollbackMethodName = `rollback${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)}`;

    // 3. 롤백 메서드를 컨트롤러 프로토타입에 동적으로 주입
    // 주의: 이미 구현되어 있다면 덮어쓰지 않도록 확인
    if (!target[rollbackMethodName]) {
      target[rollbackMethodName] = async function (
        data: any,
        context: RmqContext,
      ) {
        logger.warn(
          `🚨 [Rollback Triggered] Method: ${rollbackMethodName}, Event: ${rollbackEventPattern}`,
        );

        // 서비스 인스턴스 찾기 (authService라는 이름으로 주입되었다고 가정)
        // 더 안전하게 하려면 'Service'로 끝나는 프로퍼티를 찾을 수도 있음
        const service =
          this.authService || this.userService || this.twitService;

        if (service && typeof service[rollbackMethodName] === 'function') {
          try {
            await service[rollbackMethodName](data);
            logger.log(`✅ 롤백 성공: ${rollbackMethodName}`);
          } catch (e) {
            logger.error(`❌ 롤백 실행 중 에러: ${e.message}`);
          }
        } else {
          logger.error(
            `❌ 서비스에 롤백 메서드가 없습니다: ${rollbackMethodName}을(를) 구현해주세요.`,
          );
        }

        // ACK 처리
        if (this.rmqService) {
          this.rmqService.ack(context);
        }
      };
    }

    // 4. 동적으로 주입된 롤백 메서드에 @EventPattern 적용
    // NestJS가 스캔할 때 이 메서드를 발견하도록 Descriptor를 가져와서 데코레이터 적용
    const rollbackDescriptor = Object.getOwnPropertyDescriptor(
      target,
      rollbackMethodName,
    );
    if (rollbackDescriptor) {
      const eventHandler = EventPattern(rollbackEventPattern);
      eventHandler(target, rollbackMethodName, rollbackDescriptor);

      // 변경된 Descriptor를 다시 프로토타입에 정의 (중요!)
      Object.defineProperty(target, rollbackMethodName, rollbackDescriptor);
    }
  };
}
