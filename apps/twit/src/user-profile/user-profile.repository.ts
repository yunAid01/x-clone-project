import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfile } from '@prisma/client-twit';
import { PRISMA_ERRORS } from '@repo/common';

@Injectable()
export class UserProfileRepository {
  protected readonly logger = new Logger(UserProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async duplicateUserProfile(data: {
    userId: string;
    email: string;
    nickname: string;
  }) {
    return this.prisma.userProfile.create({
      data: {
        userId: data.userId,
        email: data.email,
        nickname: data.nickname,
      },
    });
  }

  async findUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await this.prisma.userProfile.findUnique({
        where: { userId },
      });
      if (!user) {
        throw new Error(`UserProfile not found: ${userId}`);
      }
      return user as UserProfile;
    } catch (error: any) {
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND) {
        this.logger.error(`Error finding user profile: ${error.message}`);
      }
      throw error;
    }
  }
}
