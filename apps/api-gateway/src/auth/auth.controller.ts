import { Controller, Inject, Post, Body, HttpException, HttpCode } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

// DTOs
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { ZodResponse } from 'nestjs-zod';
import { catchError, throwError } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  userRegister(@Body() registerData: RegisterDto) {
    console.log('🚀 [Gateway] Auth 서비스로 register 신호를 보냅니다...');
    return this.authClient.send({ cmd: 'register' }, registerData);
  }

  @Post('login')
  @HttpCode(200)
  // todo - @ZodResponse()
  userLogin(@Body() loginData: LoginDto) {
    console.log('🚀 [Gateway] Auth 서비스로 login 신호를 보냅니다...');
    return this.authClient.send({ cmd: 'login' }, { ...loginData });
  }
}
