import { Injectable } from '@nestjs/common';
import { TwitRepository } from './twit.repository';
import { RmqPublisher, toRpcException } from '@repo/common';
import { Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class TwitService {
  private readonly logger = new Logger(TwitService.name);

  constructor(
    private readonly twitRepository: TwitRepository,
    private readonly publisher: RmqPublisher,
  ) {}

  async getTwits() {
    const twits = await this.twitRepository.find({});
    return twits;
  }

  @toRpcException()
  async createTwit(content: string, userId: string) {
    const user = await this.twitRepository.findUserProfile(userId);
    const newTwit = await this.twitRepository.create({
      authorId: userId,
      content: content,
      authorAvatarUrl: user.avatarUrl || '',
      authorNickname: user.nickname,
    });
    return newTwit;
  }

  async duplicateUserProfile(data: {
    userId: string;
    email: string;
    nickname: string;
  }) {
    await this.twitRepository.duplicateUserProfile({
      userId: data.userId,
      email: data.email,
      nickname: data.nickname,
    });
    return {
      message: 'User profile duplicated in Twit service',
    };
  }
}
