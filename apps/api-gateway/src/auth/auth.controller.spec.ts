import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ClientProxy } from '@nestjs/microservices';
import { ClientProxyMock } from '@repo/tests';

describe('AuthController', () => {
  let controller: AuthController;
  let authClient: ClientProxy;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AUTH', // @Inject('AUTH')와 이름이 같아야 함
          useValue: ClientProxyMock,
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
      ClientProxyMock.send.mockResolvedValue({
        status: 201,
        message: 'successfully registered',
      });
      const registerData = {
        email: 'test@example.com',
        password: '1234',
        nickname: 'Test User',
      };
      const result = await controller.userRegister(registerData);
      expect(result).toEqual({
        status: 201,
        message: 'successfully registered',
      });
      expect(authClient.send).toHaveBeenCalledWith('register', {
        ...registerData,
      });
    });
  });

  describe('login', () => {
    it('should send login queue to authMicroservice', async () => {
      expect(controller).toBeDefined();
      ClientProxyMock.send.mockResolvedValue({
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
      expect(authClient.send).toHaveBeenCalledWith('login', { ...loginData });
    });
  });
});
