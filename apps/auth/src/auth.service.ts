import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/database'; // 우리가 만든 DB 도구
import * as bcrypt from 'bcrypt'; // 암호화 도구

@Injectable()
export class AuthService {
  // PrismaService(DB)를 주방보조로 채용합니다.
  constructor(private readonly prisma: PrismaService) {}

  // 회원가입 요리 시작!
  async userRegister(data: any) {
    const { email, password, name } = data;

    // 1. 이미 있는 이메일인지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { status: 400, message: '이미 존재하는 이메일입니다.' };
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

    // 4. 비밀번호 뺀 정보만 반환 (보안)
    const { password: _, ...result } = newUser;
    return { status: 201, message: '회원가입 성공!', user: result };
  }
}
