import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { UserProfileRepository } from './userprofile.reposigory';
import { UserFollowRepository } from './userfollow.repository';
import { fakeUserProfile } from '@/test/user.mock';
// @repo/tests
import {
  UserFollowRepositoryMock,
  UserProfileRepositoryMock,
} from '@repo/tests';
import { RpcException } from '@nestjs/microservices';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserProfileRepository,
          useValue: UserProfileRepositoryMock,
        },
        {
          provide: UserFollowRepository,
          useValue: UserFollowRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  let userId = 'me-123';
  let targetUserId = 'user-456';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile', () => {
    it('should update user profile', async () => {});
  });

  describe('Follow', () => {
    it('should follow user successfully', async () => {
      UserProfileRepositoryMock.findOne.mockResolvedValue(true);
      UserFollowRepositoryMock.isFollowing.mockResolvedValue(null);
      UserFollowRepositoryMock.followUser.mockResolvedValue({
        id: 'follow-789',
        followerId: userId,
        followingId: targetUserId,
        createdAt: new Date(),
      });
      const result = await service.followUser(userId, targetUserId);

      expect(result).toEqual({ message: 'Follow success' });
      expect(UserProfileRepositoryMock.findOne).toHaveBeenCalledWith({
        userId: targetUserId,
      });
      expect(UserFollowRepositoryMock.isFollowing).toHaveBeenCalledWith(
        userId,
        targetUserId,
      );
      expect(UserFollowRepositoryMock.followUser).toHaveBeenCalledWith(
        userId,
        targetUserId,
      );
    });

    it('should throw error if user tries to follow themselves', async () => {
      UserProfileRepositoryMock.findOne.mockResolvedValue(true);
      await expect(service.followUser(userId, userId)).rejects.toThrow(
        RpcException,
      );
    });

    it('should throw error if already following the user', async () => {
      UserProfileRepositoryMock.findOne.mockResolvedValue(true);
      UserFollowRepositoryMock.isFollowing.mockResolvedValue(true);
      try {
        await service.followUser(userId, targetUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        const innerError = error.getError();
        expect(innerError).toEqual(
          expect.objectContaining({
            status: 400,
            message: 'Already following this user',
          }),
        );
      }
    });

    it('should throw error if target user does not exist', async () => {
      UserProfileRepositoryMock.findOne.mockResolvedValue(null);
      try {
        await service.followUser(userId, targetUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        const innerError = error.getError();
        expect(innerError).toEqual(
          expect.objectContaining({
            status: 400,
            message: 'Target user does not exist',
          }),
        );
      }
    });
  });

  describe('Unfollow', () => {
    it('should unfollow user successfully', async () => {
      UserProfileRepositoryMock.findOne.mockResolvedValue(true);
      UserFollowRepositoryMock.isFollowing.mockResolvedValue(true);
      UserFollowRepositoryMock.unfollowUser.mockResolvedValue(true);

      const result = await service.unfollowUser(userId, targetUserId);
      expect(result).toEqual({ message: 'Unfollow success' });
      expect(UserProfileRepositoryMock.findOne).toHaveBeenCalledWith({
        userId: targetUserId,
      });
      expect(UserFollowRepositoryMock.isFollowing).toHaveBeenCalledWith(
        userId,
        targetUserId,
      );
      expect(UserFollowRepositoryMock.unfollowUser).toHaveBeenCalledWith(
        userId,
        targetUserId,
      );
    });
  });

  it('should throw error if target user does not exist', async () => {
    UserProfileRepositoryMock.findOne.mockResolvedValue(null);
    try {
      await service.unfollowUser(userId, targetUserId);
    } catch (error) {
      expect(error).toBeInstanceOf(RpcException);
      const innerError = error.getError();
      expect(innerError).toEqual(
        expect.objectContaining({
          status: 400,
          message: 'Target user does not exist',
        }),
      );
    }
  });

  it('should throw error if trying to unfollow a user not followed', async () => {
    UserFollowRepositoryMock.isFollowing.mockResolvedValue(true);
    await expect(service.unfollowUser(userId, targetUserId)).rejects.toThrow(
      RpcException,
    );
  });

  it('should throw error if user tries to unfollow themselves', async () => {
    UserProfileRepositoryMock.findOne.mockResolvedValue(true);
    await expect(service.unfollowUser(userId, userId)).rejects.toThrow(
      RpcException,
    );
  });
});
