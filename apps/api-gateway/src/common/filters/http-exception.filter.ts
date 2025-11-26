import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices'; // 👈 RpcException 처리를 위해 추가

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 기본값 설정 (무슨 일이 있어도 서버가 죽지 않도록 500으로 시작)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal Server Error';

    // =================================================================
    // 1. 에러 타입별 분기 처리 (로직 통합)
    // =================================================================

    if (exception instanceof HttpException) {
      // ✅ Case 1: 일반적인 NestJS HTTP 에러
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof RpcException) {
      // ✅ Case 2: 마이크로서비스(RabbitMQ)에서 넘어온 RpcException
      const error = exception.getError();

      // 2-1. RpcException 내부에 HttpException이 숨어있는 경우
      if (error instanceof HttpException) {
        status = error.getStatus();
        message = error.getResponse();
      }
      // 2-2. 객체 형태로 에러가 온 경우 ({ statusCode: 400, message: "..." })
      else if (typeof error === 'object' && error !== null) {
        const rawStatus = (error as any).statusCode || (error as any).status;
        status = this.normalizeStatus(rawStatus); // 문자열일 수도 있으니 정제
        message = (error as any).message || message;
      }
      // 2-3. 그 외 (단순 문자열 에러 등)
      else {
        message = error;
      }
    } else {
      // ✅ Case 3: 그 외 일반 에러 (JavaScript Error 등)
      const rawStatus =
        (exception as any).statusCode || (exception as any).status;
      status = this.normalizeStatus(rawStatus);
      message = (exception as any).message || message;
    }

    // =================================================================
    // 2. 최종 데이터 정제 (안전장치)
    // =================================================================

    // 🛡️ 상태 코드가 숫자가 아니거나 NaN이면 무조건 500으로 고정
    if (typeof status !== 'number' || isNaN(status)) {
      console.warn(
        `🚨 [Global Filter] 비정상 status 감지: ${status} -> 500으로 변경함`,
      );
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // 📝 메시지가 객체인 경우, 클라이언트가 보기 좋게 문자열이나 특정 속성만 추출
    if (
      typeof message === 'object' &&
      message !== null &&
      !Array.isArray(message)
    ) {
      // message 속성이 있으면 그걸 쓰고, 없으면 error 속성, 그것도 없으면 통째로 보냄
      message = (message as any).message || (message as any).error || message;
    }

    // =================================================================
    // 3. 로그 출력 (디버깅용)
    // =================================================================
    // console.error('======================================');
    // console.error('🚨 [Global Filter] 에러 발생!');
    // console.error(`👉 Request URL: ${request.url}`);
    // console.error(`👉 Final Status: ${status}`);
    // console.error(`👉 Message: ${JSON.stringify(message)}`);
    // // console.error('👉 Original Error:', exception); // 필요하면 주석 해제해서 원본 확인
    // console.error('======================================');

    // =================================================================
    // 4. 응답 전송
    // =================================================================
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }

  /**
   * 🛠️ 상태 코드를 안전한 숫자로 변환하는 헬퍼 함수
   * - 문자열 "400" -> 숫자 400
   * - "error", undefined, null -> 500
   */
  private normalizeStatus(status: unknown): number {
    if (typeof status === 'number') {
      return status;
    }
    if (typeof status === 'string') {
      const parsed = parseInt(status, 10);
      // 숫자로 변환 안 되면(NaN) 500 반환
      return isNaN(parsed) ? HttpStatus.INTERNAL_SERVER_ERROR : parsed;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
