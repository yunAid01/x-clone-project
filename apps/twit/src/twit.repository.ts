import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, PRISMA_ERRORS } from '@repo/common';
import { PrismaService } from './prisma/prisma.service';
import { Twit, Prisma, UserProfile } from '@prisma/client-twit';

@Injectable()
export class TwitRepository extends AbstractRepository<Twit> {
  protected readonly logger = new Logger(TwitRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Omit<Twit, 'id' | 'createdAt'>): Promise<Twit> {
    try {
      const newTwit = await this.prisma.twit.create({
        data: {
          authorAvatarUrl: data.authorAvatarUrl,
          authorNickname: data.authorNickname,
          content: data.content,
          authorId: data.authorId,
        },
      });
      this.logger.log(`Created new Twits: ${newTwit.id}`);
      return newTwit;
    } catch (error: any) {
      this.logger.error(`Error creating Twit: ${error.message}`);
      throw error;
    }
  }

  async findOne(filterQuery: Prisma.TwitWhereInput): Promise<Twit> {
    try {
      const twit = await this.prisma.twit.findFirst({ where: filterQuery });
      return twit as Twit;
    } catch (error: any) {
      this.logger.error(error);
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND) {
        this.ensureExists(null, 'Twit');
      }
      throw error;
    }
  }

  async findOneAndUpdate(
    filterQuery: Prisma.TwitWhereUniqueInput,
    updateData: Partial<Twit>,
  ): Promise<Twit> {
    try {
      const twit = await this.prisma.twit.update({
        where: filterQuery,
        data: updateData as Prisma.TwitUpdateInput,
      });
      return twit;
    } catch (error: any) {
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND)
        this.ensureExists(null, 'Twit');
      throw error;
    }
  }

  async find(filterQuery: Prisma.TwitWhereInput): Promise<Twit[]> {
    return this.prisma.twit.findMany({ where: filterQuery });
  }

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
      return user as UserProfile;
    } catch (error: any) {
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND) {
        this.logger.error(`Error finding user profile: ${error.message}`);
        this.ensureExists(null, 'UserProfile');
      }
      throw error;
    }
  }
}
