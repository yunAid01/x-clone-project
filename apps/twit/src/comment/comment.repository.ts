import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@repo/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment, Prisma } from '@prisma/client-twit';

@Injectable()
export class CommentRepository extends AbstractRepository<Comment> {
  protected readonly logger = new Logger(CommentRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(
    data: Omit<Comment, 'id' | 'commentLikesCount' | 'createdAt'>,
  ): Promise<Comment> {
    try {
      const newComment = await this.prisma.comment.create({
        data: {
          twitId: data.twitId,
          authorId: data.authorId,
          authorNickname: data.authorNickname,
          authorAvatarUrl: data.authorAvatarUrl,
          content: data.content,
          parentId: data.parentId || null,
        },
      });
      this.logger.log(`Created new Comment: ${newComment.id}`);
      return newComment;
    } catch (error: any) {
      this.logger.error(`Error creating Comment: ${error.message}`);
      throw error;
    }
  }

  async findOne(filterQuery: Prisma.CommentWhereInput): Promise<Comment> {
    try {
      const comment = await this.prisma.comment.findFirst({
        where: filterQuery,
        include: {
          replies: true,
        },
      });
      this.ensureExists(comment, 'Comment');
      return comment as Comment;
    } catch (error: any) {
      this.logger.error(`Error finding Comment: ${error.message}`);
      throw error;
    }
  }

  async find(filterQuery: Prisma.CommentWhereInput): Promise<Comment[]> {
    try {
      const comments = await this.prisma.comment.findMany({
        where: filterQuery,
        include: {
          replies: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return comments;
    } catch (error: any) {
      this.logger.error(`Error finding Comments: ${error.message}`);
      throw error;
    }
  }

  async findOneAndUpdate(
    filterQuery: Prisma.CommentWhereUniqueInput,
    update: Prisma.CommentUpdateInput,
  ): Promise<Comment> {
    try {
      const updatedComment = await this.prisma.comment.update({
        where: filterQuery,
        data: update,
      });
      this.logger.log(`Updated Comment: ${updatedComment.id}`);
      return updatedComment;
    } catch (error: any) {
      this.logger.error(`Error updating Comment: ${error.message}`);
      throw error;
    }
  }

  async delete(filterQuery: Prisma.CommentWhereUniqueInput): Promise<boolean> {
    try {
      const deletedComment = await this.prisma.comment.delete({
        where: filterQuery,
      });
      this.logger.log(`Deleted Comment: ${deletedComment.id}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error deleting Comment: ${error.message}`);
      throw error;
    }
  }

  async updateMany(
    filterQuery: Prisma.CommentWhereInput,
    update: Prisma.CommentUpdateInput,
  ): Promise<number> {
    try {
      const result = await this.prisma.comment.updateMany({
        where: filterQuery,
        data: update,
      });
      this.logger.log(`Updated ${result.count} Comment(s)`);
      return result.count;
    } catch (error: any) {
      this.logger.error(`Error updating Comments: ${error.message}`);
      throw error;
    }
  }
}
