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
    await this.userProfileRepository.duplicateUserProfile({
      userId: data.userId,
      email: data.email,
      nickname: data.nickname,
    });
    return {
      message: 'User profile duplicated in Twit service',
    };
  }
}
