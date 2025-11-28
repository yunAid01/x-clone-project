import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class FitRpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // 1. 이미 RPC 에러인 경우 (데코레이터 등이 처리한 경우 포함)
    if (exception instanceof RpcException) {
      // 에러 내용을 확인하고, 우리가 원하는 포맷({ status, message })이 아니면 변환 시도
      console.log('🚀 [FitRpcExceptionFilter] RpcException 포맷 점검 중...');
      const error = exception.getError();
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        'message' in error
      ) {
        return throwError(() => exception); // 이미 완벽한 포맷이면 그대로 통과
      }
      // 포맷이 안 맞으면 감싸서 던지기 (기존 에러 내용 유지)
      return throwError(() => new RpcException(error));
    }

    // 2. HTTP 에러인 경우
    if (exception instanceof HttpException) {
      console.log(
        '🚀 [FitRpcExceptionFilter] HttpException을 RpcException으로 변환 중...',
      );
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && (response as any).message
          ? (response as any).message
          : response;

      // Gateway가 이해할 수 있는 포맷으로 변환
      return throwError(() => new RpcException({ status, message }));
    }

    // 3. 그 외 일반 에러 (Error 등)
    // 500 에러로 처리하되, 에러 메시지는 유지
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';
    console.log(
      '🚀 [FitRpcExceptionFilter] 일반 에러를 RpcException으로 변환 중...',
    );
    return throwError(() => new RpcException({ status, message }));
  }
}
