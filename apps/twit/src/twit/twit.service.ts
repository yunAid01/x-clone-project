import { BadRequestException, Injectable } from '@nestjs/common';
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

  async updateTwit(userId: string, twitId: string, content: string) {
    const twit = await this.twitRepository.findOne({
      id: twitId,
    });
    if (twit.authorId !== userId) {
      throw new BadRequestException('can only update your own twit.');
    }
    const updatedTwit = await this.twitRepository.findOneAndUpdate(
      { id: twitId },
      { content: content },
    );
    return updatedTwit;
  }

  async deleteTwit(userId: string, twitId: string) {
    const twit = await this.twitRepository.findOne({
      id: twitId,
    });
    if (twit.authorId !== userId) {
      throw new BadRequestException('can only delete your own twit.');
    }
    const isDeleted = await this.twitRepository.delete({ id: twitId });
    return {
      isDeleted,
      message: 'Twit deleted successfully',
    };
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
    return { updated: count };
  }
}
