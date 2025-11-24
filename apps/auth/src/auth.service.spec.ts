import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

// bcypt 호출시 jest의 mock 함수로 대체
jest.mock('bcrypt', () => ({
  compare: jest.fn(), // 'compare' 함수를 '가짜'로 만듦
  hash: jest.fn(), // 'hash' 함수도 '가짜'로 만듦
}));
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};
const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    prisma = app.get<PrismaService>(PrismaService);
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
  const fakeUserDBData = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should be registered with correct data"', async () => {
      mockPrismaService.user.create = jest
        .fn()
        .mockResolvedValue(fakeUserDBData);
      mockPrismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      const result = await service.userRegister(registerData);
      expect(result).toEqual({
        status: 201,
        message: 'successfully registered',
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          name: registerData.name,
          password: hashedPassword,
          role: 'USER',
        },
      });
    });

    it('should fail login with already exist account', async () => {
      mockPrismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(fakeUserDBData);
      await expect(service.userRegister(registerData)).rejects.toThrow(
        BadRequestException,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should be logged in with correct data"', async () => {
      mockPrismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(fakeUserDBData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign = jest.fn().mockReturnValue(fakeToken);

      const result = await service.userLogin(loginData);
      expect(result).toEqual({
        status: 200,
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
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: fakeUserDBData.id,
        email: fakeUserDBData.email,
      });
    });

    it('should fail login with not exist account', async () => {
      mockPrismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.userLogin(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should fail login with invalid password', async () => {
      mockPrismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(fakeUserDBData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.userLogin(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});
