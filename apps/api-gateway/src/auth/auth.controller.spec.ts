import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ClientProxy } from '@nestjs/microservices';
import { emit } from 'process';

const mockClientProxy = {
  send: jest.fn(),
  emit: jest.fn(),
};
describe('AuthController', () => {
  let controller: AuthController;
  let authClient: ClientProxy;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AUTH_SERVICE', // @Inject('AUTH_SERVICE')와 이름이 같아야 함
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    controller = app.get<AuthController>(AuthController);
    authClient = app.get<ClientProxy>('AUTH_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks(); // 테스트끼리 간섭 없도록 호출 기록 초기화
  });

  describe('register', () => {
    it('should send register queue to authMicroservice', async () => {
      mockClientProxy.send = jest.fn().mockResolvedValue({
        status: 201,
        message: 'successfully registered',
      });
      const registerData = {
        email: 'test@example.com',
        password: '1234',
        name: 'Test User',
      };
      const result = await controller.userRegister(registerData);
      expect(result).toEqual({
        status: 201,
        message: 'successfully registered',
      });
      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: 'register' },
        { ...registerData },
      );
    });
  });

  describe('login', () => {
    it('should send login queue to authMicroservice', async () => {
      expect(controller).toBeDefined();
      mockClientProxy.send = jest.fn().mockResolvedValue({
        status: 200,
        message: 'successfully logged in',
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      const loginData = {
        email: 'test@example.com',
        password: '1234',
      };
      const result = await controller.userLogin(loginData);
      expect(result).toEqual({
        status: 200,
        message: 'successfully logged in',
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: 'login' },
        { ...loginData },
      );
    });
  });
});
