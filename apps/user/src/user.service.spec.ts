import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from './prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  follow: {
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  userProfile: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  let userId = 'user-123';
  let targetId = 'user-456';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile', () => {
    it('should update user profile', async () => {});
  });

  describe('Follow', () => {
    it('should follow user successfully', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue({
        id: targetId,
      });
      mockPrismaService.follow.findUnique.mockResolvedValue(null);
      mockPrismaService.follow.create.mockResolvedValue({
        followerId: userId,
        followingId: targetId,
      });
      const result = await service.followUser(userId, targetId);

      expect(result).toEqual({ message: 'Follow success' });
      expect(mockPrismaService.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: userId,
          followingId: targetId,
        },
      });
    });

    it('should throw error if user tries to follow themselves', async () => {
      await expect(service.followUser(userId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if already following the user', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue({
        followerId: userId,
        followingId: targetId,
      });

      await expect(service.followUser(userId, targetId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if target user does not exist', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);
      await expect(service.followUser(userId, targetId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Unfollow', () => {
    it('should unfollow user successfully', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue({
        id: targetId,
      });
      mockPrismaService.follow.findUnique.mockResolvedValue({
        followerId: userId,
        followingId: targetId,
      });
      mockPrismaService.follow.delete.mockResolvedValue({
        followerId: userId,
        followingId: targetId,
      });

      const result = await service.unfollowUser(userId, targetId);
      expect(result).toEqual({ message: 'Unfollow success' });
      expect(mockPrismaService.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetId,
          },
        },
      });
    });

    it('should throw error if target user does not exist', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);
      await expect(service.unfollowUser(userId, targetId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if trying to unfollow a user not followed', async () => {
      mockPrismaService.follow.findUnique.mockResolvedValue(true);
      await expect(service.unfollowUser(userId, targetId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if user tries to unfollow themselves', async () => {
      await expect(service.unfollowUser(userId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
