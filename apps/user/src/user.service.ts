import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserProfileRepository } from './userprofile.reposigory';
import { UserFollowRepository } from './userfollow.repository';
import { toRpcException } from '@repo/common';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userFollowRepository: UserFollowRepository,
  ) {}

  @toRpcException()
  async createUserProfile(data: any) {
    const { userId, email, nickname } = data;
    const newUserProfile = await this.userProfileRepository.create({
      userId: userId,
      email: email,
      nickname: nickname,
    });
    return newUserProfile;
  }

  @toRpcException()
  async getAllUsers() {
    const userProfiles = await this.userProfileRepository.find({});
    return userProfiles;
  }

  @toRpcException()
  async getUserProfile(id: string) {
    const userProfile = await this.userProfileRepository.findOne({
      id: id,
    });
    return userProfile;
  }

  @toRpcException()
  async updateUserProfile(data: any) {
    const { id, ...updateData } = data;
    const updatedUser = await this.userProfileRepository.findOneAndUpdate(
      { id: id },
      updateData,
    );
    return updatedUser;
  }

  @toRpcException()
  async followUser(userId: string, targetUserId: string) {
    const targetUser = await this.userProfileRepository.findOne({
      userId: targetUserId,
    });
    if (!targetUser) {
      throw new BadRequestException('Target user does not exist');
    }
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }
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

  @toRpcException()
  async unfollowUser(userId: string, targetUserId: string) {
    const targetUser = await this.userProfileRepository.findOne({
      userId: targetUserId,
    });
    if (!targetUser) {
      throw new BadRequestException('Target user does not exist');
    }
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }
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
