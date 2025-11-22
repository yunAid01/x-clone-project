import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitService {
  getHello(): string {
    return 'Hello World!';
  }
}
