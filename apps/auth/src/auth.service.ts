import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // PrismaService(DB)를 주방보조로 채용합니다.
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입 요리 시작!
  async userRegister(data: any) {
    const { email, password, name } = data;

    // 1. 이미 있는 이메일인지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // 2. 비밀번호 암호화 (해싱)
    // "1234" -> "$2b$10$Xk..." (알아볼 수 없게 바꿈)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. DB에 저장!
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // 기본 권한
      },
    });

    return { status: 201, message: 'successfully registered' };
  }

  async userLogin(data) {
    const { email, password } = data;

    // 1. 이메일로 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // 2. 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    // 3. 로그인 성공!
    return {
      status: 200,
      token: token,
      message: 'successfully logged in',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
