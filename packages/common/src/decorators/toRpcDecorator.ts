import { HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export function toRpcException() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originMethod = descriptor.value;
    descriptor.value = async function (...args: any) {
      try {
        // decorator가 사용될 원래 메서드를 실행
        return await originMethod.apply(this, args);
      } catch (err: any) {
        // HttpException인 경우 status와 message 추출
        if (err instanceof HttpException) {
          const status = err.getStatus();
          const response = err.getResponse();
          const message =
            typeof response === 'object' && (response as any).message
              ? (response as any).message
              : response;
          throw new RpcException({ status, message });
        }
        // 일반 에러는 그대로 RpcException으로 감싸기
        throw new RpcException(err);
      }
    };
  };
}
