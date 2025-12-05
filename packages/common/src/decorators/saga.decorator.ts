import { RmqPublisher } from '../rmq/rmq.publisher';
import { Logger } from '@nestjs/common';

export interface SsagaziOptions {
  /** 성공 시 발행할 이벤트 패턴 (예: 'user.created') */
  successMessage: string;
  /** * 성공 시 발행할 데이터 생성 함수
   * (result: 메서드 반환값, args: 메서드 인자 배열) => 발행할 데이터
   * 생략 시 메서드 반환값이 그대로 발행됨
   */
  successData?: (result: any, args: any[]) => any;

  /** 실패 시 발행할 이벤트 패턴 (보상 트랜잭션용, 예: 'user.creation_failed') */
  failureMessage: string;
  /** * 실패 시 발행할 데이터 생성 함수
   * (error: 발생한 에러, args: 메서드 인자 배열) => 발행할 데이터
   * 생략 시 { error: error.message, args } 형태로 발행됨
   */
  failureData?: (error: any, args: any[]) => any;
}

// 이 인터페이스를 구현하는 클 래스만 @Ssagazi를 쓸 수 있음 (타입 강제)
export interface SsagaziContainer {
  publisher: RmqPublisher;
}

/**
 * 🤬 Ssagazi (Saga) Pattern Decorator
 * 메서드 실행 성공/실패에 따라 자동으로 이벤트를 발행하여 분산 트랜잭션을 관리합니다.
 * 주의: 이 데코레이터를 사용하는 클래스는 반드시 'publisher' 프로퍼티(RmqPublisher)를 가지고 있어야 합니다.
 */
export function Ssagazi(options: SsagaziOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger('SsagaziDecorator');

    descriptor.value = async function (...args: any[]) {
      // 1. 런타임 안전장치: publisher가 있는지 확인
      const publisher = (this as any).publisher;

      if (!publisher) {
        const errorMsg = `❌ [Ssagazi] ${target.constructor.name} 클래스에 'publisher'가 없습니다. RmqPublisher를 주입받으세요.`;
        logger.error(errorMsg);
        // publisher가 없으면 그냥 원래 메서드 실행 (Saga 로직 무시)
        return originalMethod.apply(this, args);
      }

      try {
        // 2. 원래 비즈니스 로직 실행
        const result = await originalMethod.apply(this, args);

        // 3. 성공 이벤트 발행 (Happy Path)
        const payload = options.successData
          ? options.successData(result, args)
          : result;

        publisher.publish(options.successMessage, payload);
        logger.debug(
          `✅ [Ssagazi] 성공 이벤트 발행: ${options.successMessage}`,
        );

        return result;
      } catch (error: any) {
        // 4. 실패 이벤트 발행 (Compensating Transaction)
        logger.warn(
          `🔥 [Ssagazi] ${propertyKey} 실패! 보상 이벤트 발행: ${options.failureMessage}`,
        );

        const payload = options.failureData
          ? options.failureData(error, args)
          : { error: error.message, input: args[0] }; // 기본적으로 첫 번째 인자(DTO)를 보냄

        publisher.publish(options.failureMessage, payload);

        // 5. 에러는 다시 던져서 컨트롤러나 필터가 처리하게 함
        throw error;
      }
    };

    return descriptor;
  };
}
