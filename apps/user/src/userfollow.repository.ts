import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PRISMA_ERRORS } from '@repo/common';
import { PrismaService } from './prisma/prisma.service';
import { Follow } from '@prisma/client-user';

@Injectable()
export class UserFollowRepository {
  protected readonly logger = new Logger(UserFollowRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    try {
      const follow = await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      this.logger.log(`User ${followerId} followed ${followingId}`);
      return follow;
    } catch (error: any) {
      this.logger.error(`Error creating follow: ${error.message}`);
      throw error;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<Follow> {
    try {
      const follow = await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      this.logger.log(`User ${followerId} unfollowed ${followingId}`);
      return follow;
    } catch (error: any) {
      this.logger.error(`Error deleting follow: ${error.message}`);
      throw error;
    }
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: true,
      },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: true,
      },
    });
  }

  /** followerId: 팔로잉하는 사람 followingId: 팔로잉 당하는 사람 */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return !!follow;
  }

  async getFollowerCount(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: { followingId: userId },
    });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: { followerId: userId },
    });
  }
}
