import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from './user-profile.repository';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly userProfileRepository: UserProfileRepository) {}

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
