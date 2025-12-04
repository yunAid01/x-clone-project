import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object') {
        message = (res as any).message;
        error = (res as any).error || error;
      } else {
        message = res;
      }
    } else if (exception?.error && typeof exception.error === 'object') {
      // RPC 에러 (exception.error.status, exception.error.message)
      status = exception.error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.error.message || 'Microservice Error';
      error = 'Microservice Error';
    } else if (exception && exception.status) {
      // 레거시 RPC 에러 (exception.status, exception.message)
      status = exception.status;
      message = exception.message;
      error = 'Microservice Error';
    }

    this.logger.error(
      `[${request.method}] ${request.url} >> Status: ${status}, Msg: ${JSON.stringify(message)}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    });
  }
}
