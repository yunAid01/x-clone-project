import { Injectable, Logger } from '@nestjs/common';
import {
  AbstractRepository,
  PRISMA_ERRORS,
  toRpcException,
} from '@repo/common';
import { PrismaService } from './prisma/prisma.service';
import { UserProfile, Prisma } from '@prisma/client-user';

@Injectable()
export class UserProfileRepository extends AbstractRepository<UserProfile> {
  protected readonly logger = new Logger(UserProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: Omit<UserProfile, 'id' | 'bio' | 'avatarUrl'>,
  ): Promise<UserProfile> {
    try {
      const newUserProfile = await this.prisma.userProfile.create({
        data: data as Prisma.UserProfileCreateInput,
      });
      this.logger.log(`Created new UserProfile: ${newUserProfile.email}`);
      return newUserProfile;
    } catch (error: any) {
      this.logger.error(`Error creating UserProfile: ${error.message}`);
      throw error;
    }
  }

  async findOne(
    filterQuery: Prisma.UserProfileWhereInput,
  ): Promise<UserProfile> {
    try {
      const userProfile = await this.prisma.userProfile.findFirst({
        where: filterQuery,
      });
      this.ensureExists(userProfile, 'UserProfile');
      return userProfile as UserProfile;
    } catch (error: any) {
      this.logger.error(`Error finding UserProfile: ${error.message}`);
      throw error;
    }
  }

  async findOneAndUpdate(
    filterQuery: Prisma.UserProfileWhereUniqueInput,
    update: Partial<UserProfile>,
  ): Promise<UserProfile> {
    try {
      const userProfile = await this.prisma.userProfile.update({
        where: filterQuery,
        data: update as Prisma.UserProfileUpdateInput,
      });
      this.ensureExists(userProfile, 'UserProfile');
      return userProfile;
    } catch (error: any) {
      this.logger.error(`Error updating UserProfile: ${error.message}`);
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND) {
        this.ensureExists(null, 'UserProfile');
      }
      throw error;
    }
  }

  async find(
    filterQuery: Prisma.UserProfileWhereInput,
  ): Promise<UserProfile[]> {
    return this.prisma.userProfile.findMany({ where: filterQuery });
  }
}
