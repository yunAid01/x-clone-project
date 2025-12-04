import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class FitRpcExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(FitRpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    this.logger.error('🔥 [FitRpcExceptionFilter] 예외 감지:', exception);

    // RabbitMQ 컨텍스트에서 ACK 처리
    const ctx = host.switchToRpc().getContext();
    if (ctx && typeof ctx.getChannelRef === 'function') {
      try {
        const channel = ctx.getChannelRef();
        const message = ctx.getMessage();
        channel.ack(message);
        this.logger.log('✅ [FitRpcExceptionFilter] 메시지 ACK 처리 완료');
      } catch (ackError) {
        this.logger.error(
          '❌ [FitRpcExceptionFilter] ACK 처리 실패:',
          ackError,
        );
      }
    }

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
      this.logger.debug(
        '🚀 [FitRpcExceptionFilter] RpcException 에러지만 RpcException 포맷이 맞지 않아 변환 완료',
      );
      // 포맷이 안 맞으면 감싸서 던지기 (기존 에러 내용 유지)
      return throwError(() => new RpcException(error));
    }

    // 2. HTTP 에러인 경우
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && (response as any).message
          ? (response as any).message
          : response;
      this.logger.debug(
        '🚀 [FitRpcExceptionFilter] HttpException을 RpcException으로 변환',
      );
      // Gateway가 이해할 수 있는 포맷으로 변환
      return throwError(() => new RpcException({ status, message }));
    }

    // 3. 그 외 일반 에러 (Error 등)
    // 500 에러로 처리하되, 에러 메시지는 유지
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';
    this.logger.debug(
      '🚀 [FitRpcExceptionFilter] 일반 에러를 RpcException으로 변환',
    );
    return throwError(() => new RpcException({ status, message }));
  }
}
