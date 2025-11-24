import { Test, TestingModule } from '@nestjs/testing';
import { TwitController } from './twit.controller';
import { TwitService } from './twit.service';

describe('TwitController', () => {
  let twitController: TwitController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TwitController],
      providers: [TwitService],
    }).compile();

    twitController = app.get<TwitController>(TwitController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(twitController.getHello()).toBe('Hello World!');
    });
  });
});
