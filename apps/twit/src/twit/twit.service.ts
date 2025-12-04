import { Injectable } from '@nestjs/common';
import { RmqPublisher, toRpcException } from '@repo/common';
import { Logger } from '@nestjs/common';
import { UserProfileRepository } from '../user-profile/user-profile.repository';
import { TwitRepository } from './twit.repository';

@Injectable()
export class TwitService {
  private readonly logger = new Logger(TwitService.name);

  constructor(
    private readonly twitRepository: TwitRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly publisher: RmqPublisher,
  ) {}

  @toRpcException()
  async getTwitById(twitId: string) {
    const twit = await this.twitRepository.findOne({ id: twitId });
    return twit;
  }

  @toRpcException()
  async getTwits() {
    const twits = await this.twitRepository.find({});
    return twits;
  }

  @toRpcException()
  async createTwit(content: string, userId: string) {
    const user = await this.userProfileRepository.findUserProfile(userId);
    const newTwit = await this.twitRepository.create({
      authorId: userId,
      content: content,
      authorAvatarUrl: user.avatarUrl || '',
      authorNickname: user.nickname,
    });
    return newTwit;
  }
}
