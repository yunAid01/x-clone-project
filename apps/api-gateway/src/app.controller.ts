import { Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('TWIT_SERVICE') private readonly twitClient: ClientProxy,
  ) {}

  @Post('login')
  userLogin() {
    console.log('🚀 [Gateway] Auth 서비스로 신호를 보냅니다...');
    return this.authClient.send(
      { cmd: 'login' },
      { userId: 'test-user', password: '123' },
    );
  }

  @Post('register')
  userRegister() {
    console.log('🚀 [Gateway] Auth 서비스로 신호를 보냅니다...');
    return this.authClient.send(
      { cmd: 'register' },
      { userId: 'new-user', password: '456', email: 'new-user@example.com' },
    );
  }

  @Get('twits')
  getTwits() {
    console.log('🚀 [Gateway] Twit 서비스로 신호를 보냅니다...');
    return this.twitClient.send({ cmd: 'get_tweets' }, {});
  }
}
