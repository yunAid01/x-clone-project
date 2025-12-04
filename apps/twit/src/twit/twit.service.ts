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

  async getTwitById(twitId: string) {
    const twit = await this.twitRepository.findOne({ id: twitId });
    return twit;
  }

  async getTwits() {
    const twits = await this.twitRepository.find({});
    return twits;
  }

  async createTwit(content: string, userId: string) {
    const user = await this.userProfileRepository.findOne({ userId: userId });
    const newTwit = await this.twitRepository.create({
      authorId: userId,
      content: content,
      authorAvatarUrl: user.avatarUrl || '',
      authorNickname: user.nickname,
    });
    return newTwit;
  }

  async updateAuthorInfoInTwits(userId: string, updateData: any) {
    const updateFields: any = {};
    if (updateData.nickname) updateFields.authorNickname = updateData.nickname;
    if (updateData.avatarUrl)
      updateFields.authorAvatarUrl = updateData.avatarUrl;

    const count = await this.twitRepository.updateMany(
      { authorId: userId },
      updateFields,
    );
    this.logger.log(
      `Updated ${count} twit(s) with new author info for user (${userId})`,
    );
    const updatedUser = await this.userProfileRepository.findOneAndUpdate(
      { userId },
      updateData,
    );
    this.logger.log(
      `User(duplicated) profile updated in Twit service: ${JSON.stringify(updatedUser)}`,
    );
    return { updated: count };
  }
}
