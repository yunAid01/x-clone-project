import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  @MessagePattern({ cmd: 'login' })
  userLogin(@Payload() data: any) {
    return this.authService.userLogin(data);
  }

  @Post()
  @MessagePattern({ cmd: 'register' })
  userRegister(@Payload() data: any) {
    return this.authService.userRegister(data);
  }
}
