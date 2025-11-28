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
import { RmqService } from '@repo/common';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('register')
  userRegister(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`🚀 [Auth] register 요청 수신: ${data.email}`);
    const result = this.authService.userRegister(data);
    this.rmqService.ack(context);
    return result;
  }

  @MessagePattern('login')
  userLogin(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`🚀 [Auth] login 요청 수신: ${data.email}`);
    const result = this.authService.userLogin(data);
    this.rmqService.ack(context);
    return result;
  }
}
