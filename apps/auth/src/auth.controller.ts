import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly AuthService: AuthService) {}
  // @MessagePattern({ cmd: 'login' })
  // userLogin(@Payload() data: any) {
  //   return this.appService.userLogin(data);
  // }
  @MessagePattern({ cmd: 'register' })
  userRegister(@Payload() data: any) {
    return this.AuthService.userRegister(data);
  }
}
