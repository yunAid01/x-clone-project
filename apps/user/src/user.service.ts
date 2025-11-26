import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUserProfile(data: any) {
    const { userId, email, nickname } = data;
    try {
      const userProfile = await this.prisma.userProfile.create({
        data: {
          userId: userId,
          email: email,
          nickname: nickname,
        },
      });
      console.log(`✅ [User] 프로필 생성 완료!`);
      return userProfile;
    } catch (error) {
      throw new InternalServerErrorException('User profile creation failed');
    }
  }

  async getUserProfile(id: string) {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { id: id },
    });
    return userProfile;
  }

  async updateUserProfile(data: any) {
    const { id, ...updateData } = data;
    const updatedUser = await this.prisma.userProfile.update({
      where: { id: id },
      data: updateData,
    });
    return updatedUser;
  }

  async followUser(userId: string, targetUserId: string) {
    const targetUser = await this.prisma.userProfile.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new BadRequestException('Target user does not exist');
    }
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });
    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }
    try {
      await this.prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId,
        },
      });
      return { message: 'Follow success' };
    } catch (error) {
      throw new InternalServerErrorException('follow failed');
    }
  }

  async unfollowUser(userId: string, targetUserId: string) {
    const targetUser = await this.prisma.userProfile.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new BadRequestException('Target user does not exist');
    }
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });
    if (!existingFollow) {
      throw new BadRequestException('Not following this user');
    }
    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
      return { message: 'Unfollow success' };
    } catch (error) {
      throw new InternalServerErrorException('unfollow failed');
    }
  }
}
