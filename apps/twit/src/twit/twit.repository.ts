import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, PRISMA_ERRORS } from '@repo/common';
import { PrismaService } from '../prisma/prisma.service';
import { Twit, Prisma } from '@prisma/client-twit';

@Injectable()
export class TwitRepository extends AbstractRepository<Twit> {
  protected readonly logger = new Logger(TwitRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: Omit<
      Twit,
      'id' | 'likeCount' | 'retwitCount' | 'commentCount' | 'createdAt'
    >,
  ): Promise<Twit> {
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
      this.ensureExists(twit, 'Twit');
      return twit as Twit;
    } catch (error: any) {
      this.logger.error(error);
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
      this.ensureExists(twit, 'Twit');
      return twit;
    } catch (error: any) {
      this.logger.error(error);
      throw error;
    }
  }

  async find(filterQuery: Prisma.TwitWhereInput): Promise<Twit[]> {
    return this.prisma.twit.findMany({ where: filterQuery });
  }

  async delete(filterQuery: Prisma.TwitWhereUniqueInput): Promise<boolean> {
    try {
      await this.prisma.twit.delete({ where: filterQuery });
      return true;
    } catch (error: any) {
      this.logger.error(`Error deleting Twit: ${error.message}`);
      throw error;
    }
  }

  // custom
  async updateMany(
    filterQuery: Prisma.TwitWhereInput,
    updateData: Prisma.TwitUpdateInput,
  ): Promise<number> {
    const result = await this.prisma.twit.updateMany({
      where: filterQuery,
      data: updateData,
    });
    return result.count;
  }
}
