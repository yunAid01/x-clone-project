import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller'; // 파일 경로 확인 필요
import { AuthService } from './auth.service';

import { AuthServiceMock, RmqServiceMock, RmqContextMock } from '@repo/tests';
import { RmqService } from '@repo/common';
// 1. 기대하는 결과값을 미리 변수로 선언 (Stub 역할)
const mockRegisterResult = {
  statusCode: 201,
  message: 'successfully registered',
};

const mockLoginResult = {
  statusCode: 200,
  message: 'successfully logged in',
  token: 'fake-jwt-token',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
};

describe('AppController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: AuthServiceMock,
        },
        {
          provide: RmqService,
          useValue: RmqServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // 테스트에 쓸 데이터 정의
  const registerData = {
    email: 'test@example.com',
    password: '1234',
    name: 'Test User',
  };

  const loginData = {
    email: 'test@example.com',
    password: '1234',
  };

  afterEach(() => {
    jest.clearAllMocks(); // 테스트끼리 간섭 없도록 호출 기록 초기화
  });

  describe('userRegister', () => {
    it('should register a user', async () => {
      AuthServiceMock.userRegister.mockResolvedValue({
        statusCode: 201,
        message: 'successfully registered',
      });
      // 컨트롤러 실행
      const result = await controller.userRegister(
        registerData,
        RmqContextMock as any,
      );
      expect(result).toEqual(mockRegisterResult);
      expect(AuthServiceMock.userRegister).toHaveBeenCalledWith(registerData);
      expect(RmqServiceMock.ack).toHaveBeenCalledWith(RmqContextMock);
    });
  });

  describe('userLogin', () => {
    it('should login a user', async () => {
      AuthServiceMock.userLogin.mockResolvedValue({
        statusCode: 200,
        message: 'successfully logged in',
        token: 'fake-jwt-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      const result = await controller.userLogin(
        loginData,
        RmqContextMock as any,
      );
      expect(result).toEqual(mockLoginResult);
      expect(AuthServiceMock.userLogin).toHaveBeenCalledWith(loginData);
      expect(RmqServiceMock.ack).toHaveBeenCalledWith(RmqContextMock);
    });
  });
});
