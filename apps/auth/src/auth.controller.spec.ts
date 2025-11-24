import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller'; // 파일 경로 확인 필요
import { AuthService } from './auth.service';

// 1. 기대하는 결과값을 미리 변수로 선언 (Stub 역할)
const mockRegisterResult = {
  status: 201,
  message: 'successfully registered',
};

const mockLoginResult = {
  status: 200,
  message: 'successfully logged in',
  token: 'fake-jwt-token',
  user: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  },
};

const mockAuthService = {
  userRegister: jest.fn().mockResolvedValue(mockRegisterResult),
  userLogin: jest.fn().mockResolvedValue(mockLoginResult),
};

describe('AppController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // 테스트끼리 간섭 없도록 호출 기록 초기화
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

  describe('userRegister', () => {
    it('should register a user', async () => {
      // When: 컨트롤러 실행
      const result = await authController.userRegister(registerData);

      // Then 1: Service가 올바른 인자와 함께 호출되었는지 확인
      expect(authService.userRegister).toHaveBeenCalledWith(registerData);

      // Then 2: 결과값이 기대한 값(mockRegisterResult)과 같은지 확인
      expect(result).toEqual(mockRegisterResult);
    });
  });

  describe('userLogin', () => {
    it('should login a user', async () => {
      // When: 컨트롤러 실행 (이 부분을 잘못 작성하셨었습니다)
      const result = await authController.userLogin(loginData);

      // Then 1: Service가 올바른 인자와 함께 호출되었는지 확인
      expect(authService.userLogin).toHaveBeenCalledWith(loginData);

      // Then 2: 결과값이 기대한 값(mockLoginResult)과 같은지 확인
      expect(result).toEqual(mockLoginResult);
    });
  });
});
