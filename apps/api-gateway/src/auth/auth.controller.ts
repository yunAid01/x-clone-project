import {
  Controller,
  Inject,
  Post,
  Body,
  HttpException,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

// DTOs
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';
import { catchError, throwError } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(@Inject('AUTH') private readonly authClient: ClientProxy) {}

  @Post('register')
  @HttpCode(201)
  // todo - @ZodResponse()
  userRegister(@Body() registerData: RegisterDto) {
    this.logger.log('🚀 [Gateway] Auth 서비스로 register 신호를 보냅니다...');
    return this.authClient.send('register', registerData);
  }

  @Post('login')
  @HttpCode(200)
  // todo - @ZodResponse()
  userLogin(@Body() loginData: LoginDto) {
    this.logger.log('🚀 [Gateway] Auth 서비스로 login 신호를 보냅니다...');
    return this.authClient.send('login', { ...loginData });
  }
}
