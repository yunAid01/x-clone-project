import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RmqService } from '@repo/common';
// Mock 가져오기
import { RmqServiceMock, RmqContextMock } from '@repo/tests';
// mock data
import { fakeUserProfile } from '../test/user.mock';

const mockUserService = {
  getUserProfile: jest.fn(),
  getAllUsers: jest.fn(),
  createUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  followUser: jest.fn(),
  unfollowUser: jest.fn(),
};

describe('User-MicroServiceController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: RmqService,
          useValue: RmqServiceMock, // 🔥 Mock 사용
        },
      ],
    }).compile();

    controller = app.get<UserController>(UserController);
    service = app.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile', () => {
    it('should create user profile', async () => {
      mockUserService.createUserProfile.mockResolvedValue(fakeUserProfile);
      const mockData = {
        userId: 'user-123',
        email: 'testuser@example.com',
        nickname: 'Test User',
      };

      // 👇 실제로 controller 메서드 호출
      await controller.createUserProfile(mockData, RmqContextMock as any);
      expect(service.createUserProfile).toHaveBeenCalledWith(mockData);
      expect(RmqServiceMock.ack).toHaveBeenCalled();
    });

    it('should return all user profiles', async () => {
      const fakeUserProfiles = [fakeUserProfile];
      mockUserService.getAllUsers.mockResolvedValue(fakeUserProfiles);
      const result = await controller.getAllUsers(RmqContextMock as any);
      expect(result).toEqual(fakeUserProfiles);
      expect(service.getAllUsers).toHaveBeenCalled();
      expect(RmqServiceMock.ack).toHaveBeenCalled();
    });

    it('should return user profile', async () => {
      mockUserService.getUserProfile.mockResolvedValue(fakeUserProfile);
      const result = await controller.getUserProfile(
        { id: 'user-123' },
        RmqContextMock as any,
      );
      expect(result).toEqual(fakeUserProfile);
      expect(service.getUserProfile).toHaveBeenCalledWith('user-123');
      expect(RmqServiceMock.ack).toHaveBeenCalled();
    });
  });

  describe('Follow User', () => {
    it('should follow user successfully', async () => {
      const mockResult = { message: 'Follow success' };
      mockUserService.followUser.mockResolvedValue(mockResult);

      const result = await controller.followUser(
        { userId: 'user-1', targetUserId: 'user-2' },
        RmqContextMock as any,
      );

      expect(result).toEqual(mockResult);
      expect(service.followUser).toHaveBeenCalledWith('user-1', 'user-2');
      expect(RmqServiceMock.ack).toHaveBeenCalled();
    });
  });
});
