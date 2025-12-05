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
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  FitRpcExceptionFilter,
  RmqService,
  SsagaziPattern,
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

  @SsagaziPattern('register', 'user.profile.creation_failed')
  async userRegister(
    @Payload() data: RegisterDtoType,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`🚀 [Auth] register 요청 수신: ${data.email}`);
    const result = await this.authService.userRegister(data);
    this.rmqService.ack(context); // 메시지 처리 후 ACK 전송
    return result;
  }

  @EventPattern('user.profile.creation_failed')
  async handleUserProfileCreationFailed(
    @Payload()
    data: {},
  ) {
    this.logger.error(
      `❌ [Auth] 사용자 프로필 생성 실패 이벤트 수신: ${JSON.stringify(data)}`,
    );
    // 추가적인 오류 처리 로직을 여기에 작성할 수 있습니다.
  }

  @MessagePattern('login')
  async userLogin(@Payload() data: LoginDtoType, @Ctx() context: RmqContext) {
    this.logger.log(`🚀 [Auth] login 요청 수신: ${data.email}`);
    const result = await this.authService.userLogin(data);
    this.rmqService.ack(context);
    return result;
  }
}
