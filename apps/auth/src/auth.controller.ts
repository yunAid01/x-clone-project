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
  async userRegister(
    @Payload() data: { email: string; password: string; nickname: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`🚀 [Auth] register 요청 수신: ${data.email}`);
      const result = await this.authService.userRegister(data);
      this.rmqService.ack(context); // 메시지 처리 후 ACK 전송
      return result;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }

  @MessagePattern('login')
  async userLogin(
    @Payload() data: { email: string; password: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`🚀 [Auth] login 요청 수신: ${data.email}`);
      const result = await this.authService.userLogin(data);
      this.rmqService.ack(context);
      return result;
    } catch (error) {
      this.logger.error(error);
      this.rmqService.ack(context); // 오류가 나도 로그만 남기고 ACK를 보내서 메시지 재처리를 막음
    }
  }
}
