import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { toRpcException } from './decorator/toRpcException';

@Injectable()
export class AuthService {
  // PrismaService(DB)를 주방보조로 채용합니다.
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  // 회원가입 요리 시작!

  @toRpcException()
  async userRegister(data: any) {
    try {
      const { email, password, name } = data;
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        console.log('Registration failed: Email already in use', email);
        throw new BadRequestException('Email already in use');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER', // 기본 권한
        },
      });
      console.log('User registered:', email);
      return { statusCode: 201, message: 'successfully registered' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @toRpcException()
  async userLogin(data: any) {
    try {
      const { email, password } = data;
      const existingUser = await this.findUserByEmail(email);
      if (!existingUser) {
        throw new BadRequestException('User not found');
      }
      // 2. 비밀번호 비교
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }
      const token = this.jwtService.sign({
        userId: existingUser.id,
        email: existingUser.email,
      });
      // 3. 로그인 성공!
      return {
        statusCode: 200,
        token: token,
        message: 'successfully logged in',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Login failed');
    }
  }
}
