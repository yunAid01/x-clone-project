import { Controller, Get, HttpCode, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  userLogin(@Payload() data: any) {
    return this.authService.userLogin(data);
  }

  @MessagePattern({ cmd: 'register' })
  userRegister(@Payload() data: any) {
    console.log('🚀 [Auth] userRegister 메서드가 호출되었습니다...');
    return this.authService.userRegister(data);
  }
}
