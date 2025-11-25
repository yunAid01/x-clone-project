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
        // 예외가 발생하면
        // RpcException으로 감싸서 throw!
        throw new RpcException(err);
      }
    };
  };
}
