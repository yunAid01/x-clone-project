import { Injectable, Logger } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { UserProfileRepository } from '../user-profile/user-profile.repository';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async createComment(
    twitId: string,
    userId: string,
    content: string,
    parentId?: string,
  ) {
    const user = await this.userProfileRepository.findOne({ userId });
    const newComment = await this.commentRepository.create({
      twitId,
      authorId: userId,
      authorNickname: user.nickname,
      authorAvatarUrl: user.avatarUrl || '',
      content,
      parentId: parentId || null,
    });

    return newComment;
  }

  async updateComment(commentId: string, content: string, userId: string) {
    const comment = await this.commentRepository.findOne({ id: commentId });
    if (comment.authorId !== userId) {
      throw new Error('can only update your own comment.');
    }
    const updatedComment = await this.commentRepository.findOneAndUpdate(
      { id: commentId },
      { content },
    );
    return updatedComment;
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentRepository.findOne({ id: commentId });
    return comment;
  }

  async getCommentsByTwitId(twitId: string) {
    const comments = await this.commentRepository.find({
      twitId,
      parentId: null, // 최상위 댓글만
    });
    return comments;
  }

  async updateAuthorInfoInComments(userId: string, updateData: any) {
    const updateFields: any = {};
    if (updateData.nickname) updateFields.authorNickname = updateData.nickname;
    if (updateData.avatarUrl)
      updateFields.authorAvatarUrl = updateData.avatarUrl;

    const count = await this.commentRepository.updateMany(
      { authorId: userId },
      updateFields,
    );

    this.logger.log(
      `Updated ${count} comment(s) with new author info for user (${userId})`,
    );
    return { updated: count };
  }

  async deleteComment(commentId: string) {
    const isDeleted = await this.commentRepository.delete({
      id: commentId,
    });
    return {
      isDeleted,
      message: 'Comment deleted successfully',
    };
  }
}
