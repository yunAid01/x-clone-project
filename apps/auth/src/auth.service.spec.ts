import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  AuthRepositoryMock,
  JwtServiceMock,
  RmqPublisherMock,
} from '@repo/tests';
import { RmqPublisher, toRpcException } from '@repo/common';
import { AuthRepository } from './auth.repository';
import { RpcException } from '@nestjs/microservices';

// bcypt 호출시 jest의 mock 함수로 대체
jest.mock('bcrypt', () => ({
  compare: jest.fn(), // 'compare' 함수를 '가짜'로 만듦
  hash: jest.fn(), // 'hash' 함수도 '가짜'로 만듦
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: JwtServiceMock },
        { provide: RmqPublisher, useValue: RmqPublisherMock },
        { provide: AuthRepository, useValue: AuthRepositoryMock },
      ],
    }).compile();

    service = app.get<AuthService>(AuthService);
  });

  let registerData = {
    email: 'test@example.com',
    password: '1234',
    name: 'Test User',
  };
  let loginData = {
    email: 'test@example.com',
    password: '1234',
  };
  const hashedPassword = '$2b$10$abcdefg1234567890hijklmnopqrstuv';
  const fakeToken = 'fake-jwt-token';
  const DATE = new Date('2025-12-03T07:13:28.878Z');
  const fakeUserDBData = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    password: hashedPassword,
    createdAt: DATE,
    updatedAt: DATE,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should be registered with correct data"', async () => {
      AuthRepositoryMock.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      AuthRepositoryMock.create.mockResolvedValue({
        id: 'user-123',
        email: registerData.email,
        name: registerData.name,
        password: hashedPassword,
        role: 'USER',
        createdAt: DATE,
      });

      const result = await service.userRegister(registerData);
      expect(result).toEqual({
        statusCode: 201,
        message: 'successfully registered',
      });
      expect(RmqPublisherMock.publish).toHaveBeenCalledWith('user.created', {
        userId: 'user-123',
        email: registerData.email,
        nickname: registerData.name,
      });
      expect(AuthRepositoryMock.findByEmail).toHaveBeenCalledWith(
        registerData.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(AuthRepositoryMock.create).toHaveBeenCalledWith({
        email: registerData.email,
        password: hashedPassword,
        name: registerData.name,
        role: 'USER',
      });
    });

    it('should fail login with already exist account', async () => {
      AuthRepositoryMock.findByEmail.mockResolvedValue(true);
      try {
        await service.userRegister(registerData);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        const rpcError = error.getError();
        expect(rpcError.message).toBe('register Error: Email already in use');
        expect(rpcError.status).toBe(400);
      }
      expect(AuthRepositoryMock.findByEmail).toHaveBeenCalledWith(
        registerData.email,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(AuthRepositoryMock.create).not.toHaveBeenCalled();
      expect(RmqPublisherMock.publish).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should be logged in with correct data"', async () => {
      AuthRepositoryMock.findByEmail.mockResolvedValue(fakeUserDBData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      JwtServiceMock.sign.mockReturnValue(fakeToken);

      const result = await service.userLogin(loginData);
      expect(result).toEqual({
        statusCode: 200,
        token: fakeToken,
        message: 'successfully logged in',
        user: {
          id: fakeUserDBData.id,
          email: fakeUserDBData.email,
          name: fakeUserDBData.name,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        fakeUserDBData.password,
      );
      expect(JwtServiceMock.sign).toHaveBeenCalledWith({
        userId: fakeUserDBData.id,
        email: fakeUserDBData.email,
      });
    });

    it('should fail login with not exist account', async () => {
      AuthRepositoryMock.findByEmail.mockResolvedValue(null);
      await expect(service.userLogin(loginData)).rejects.toThrow(RpcException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(JwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should fail login with invalid password', async () => {
      AuthRepositoryMock.findByEmail.mockResolvedValue(fakeUserDBData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.userLogin(loginData)).rejects.toThrow(RpcException);
      expect(JwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });
});
