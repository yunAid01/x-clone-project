import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserProfileRepository } from './userprofile.reposigory';
import { UserFollowRepository } from './userfollow.repository';
import { RmqPublisher, toRpcException } from '@repo/common';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userFollowRepository: UserFollowRepository,
    private readonly publisher: RmqPublisher,
  ) {}

  async createUserProfile(data: any) {
    const { userId, email, nickname } = data;
    const newUserProfile = await this.userProfileRepository.create({
      userId: userId,
      email: email,
      nickname: nickname,
    });
    return newUserProfile;
  }

  async getAllUsers() {
    const userProfiles = await this.userProfileRepository.find({});
    return userProfiles;
  }

  async getUserProfile(userId: string) {
    const userProfile = await this.userProfileRepository.findOne({
      userId: userId,
    });
    return userProfile;
  }

  async updateUserProfile(userId: string, updateUserData: any) {
    const updatedUser = await this.userProfileRepository.findOneAndUpdate(
      { userId: userId },
      updateUserData,
    );
    this.publisher.publish('user.updated', updatedUser);
    return updatedUser;
  }

  async followUser(userId: string, targetUserId: string) {
    // 1. 팔로우하는 사람(자신)이 존재하는지 확인
    const user = await this.userProfileRepository.findOne({
      userId: userId,
    });
    if (!user) {
      throw new BadRequestException('User profile does not exist');
    }

    // 2. 팔로우 대상이 존재하는지 확인
    const targetUser = await this.userProfileRepository.findOne({
      userId: targetUserId,
    });
    if (!targetUser) {
      throw new BadRequestException('Target user does not exist');
    }

    // 3. 자기 자신을 팔로우하는지 확인
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // 4. 이미 팔로우 중인지 확인
    const existingFollow = await this.userFollowRepository.isFollowing(
      userId,
      targetUserId,
    );
    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    await this.userFollowRepository.followUser(userId, targetUserId);
    return { message: 'Follow success' };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    // 1. 언팔로우하는 사람(자신)이 존재하는지 확인
    const user = await this.userProfileRepository.findOne({
      userId: userId,
    });
    if (!user) {
      throw new BadRequestException('User profile does not exist');
    }

    // 2. 언팔로우 대상이 존재하는지 확인
    const targetUser = await this.userProfileRepository.findOne({
      userId: targetUserId,
    });
    if (!targetUser) {
      throw new BadRequestException('Target user does not exist');
    }

    // 3. 자기 자신을 언팔로우하는지 확인
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    // 4. 팔로우 중인지 확인
    const existingFollow = await this.userFollowRepository.isFollowing(
      userId,
      targetUserId,
    );
    if (!existingFollow) {
      throw new BadRequestException('Not following this user');
    }

    await this.userFollowRepository.unfollowUser(userId, targetUserId);
    return { message: 'Unfollow success' };
  }
}
