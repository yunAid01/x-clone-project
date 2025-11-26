import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// mocck data
import { fakeUserProfile } from '../test/user.mock';
const mockUserService = {
  getUserProfile: jest.fn(),
};

describe('UserMicroServiceController', () => {
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
      ],
    }).compile();

    controller = app.get<UserController>(UserController);
    service = app.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Profile', () => {
    it('should return', async () => {
      mockUserService.getUserProfile.mockResolvedValue(fakeUserProfile);
      const result = await controller.getUserProfile('user-123');
      expect(result).toEqual(fakeUserProfile);
      expect(service.getUserProfile).toHaveBeenCalledWith('user-123');
    });
  });
});
