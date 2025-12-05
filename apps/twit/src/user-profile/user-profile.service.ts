import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from './user-profile.repository';
import { Logger } from '@nestjs/common';
import { Ssagazi, SsagaziContainer } from '@repo/common';
import { RmqPublisher } from '@repo/common';

@Injectable()
export class UserProfileService implements SsagaziContainer {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    public readonly publisher: RmqPublisher,
  ) {}

  @Ssagazi({
    successMessage: 'twit.profile.created',
    failureMessage: 'user.profile.created.creation_failed',
    failureData: (err, args) => ({
      userId: args[0].userId,
      email: args[0].email,
      reason: err.message,
    }),
  })
  async duplicateUserProfile(data: {
    userId: string;
    email: string;
    nickname: string;
  }) {
    await this.userProfileRepository.create({
      userId: data.userId,
      email: data.email,
      nickname: data.nickname,
    });
    return {
      message: 'User profile duplicated in Twit service',
    };
  }
  async rollbackDuplicateUserProfile(data: {
    userId: string;
    email: string;
    nickname: string;
  }) {
    this.logger.warn(
      `Rollback duplicateUserProfile triggered with data: ${JSON.stringify(
        data,
      )}`,
    );
  }

  async updateUserProfile(data: {
    userId: string;
    nickname?: string;
    avatarUrl?: string;
  }) {
    const updateFields: any = {};
    if (data.nickname) updateFields.nickname = data.nickname;
    if (data.avatarUrl) updateFields.avatarUrl = data.avatarUrl;

    const updatedUser = await this.userProfileRepository.findOneAndUpdate(
      { userId: data.userId },
      updateFields,
    );

    this.logger.log(
      `User profile updated in Twit service: ${JSON.stringify(updatedUser)}`,
    );
    return updatedUser;
  }
}
