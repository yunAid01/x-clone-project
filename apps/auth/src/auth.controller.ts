import {
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  FitRpcExceptionFilter,
  RmqService,
  toRpcException,
} from '@repo/common';
import type { LoginDtoType, RegisterDtoType } from '@repo/validation';

@Controller()
@UseFilters(new FitRpcExceptionFilter())
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('register')
  async userRegister(
    @Payload() data: RegisterDtoType,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`🚀 [Auth] register 요청 수신: ${data.email}`);
    const result = await this.authService.userRegister(data);
    this.rmqService.ack(context); // 메시지 처리 후 ACK 전송
    return result;
  }

  @MessagePattern('login')
  async userLogin(@Payload() data: LoginDtoType, @Ctx() context: RmqContext) {
    this.logger.log(`🚀 [Auth] login 요청 수신: ${data.email}`);
    const result = await this.authService.userLogin(data);
    this.rmqService.ack(context);
    return result;
  }
}
