import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@repo/common'; // 👈 공통 패키지의 설계도 import
import { PrismaService } from './prisma/prisma.service'; // 실제 일꾼(Prisma)
import { User, Prisma } from '@prisma/client-auth'; // Prisma가 만들어준 타입들

@Injectable()
export class AuthRepository extends AbstractRepository<User> {
  // 1. 로거 설정 (부모 클래스가 요구함)
  protected readonly logger = new Logger(AuthRepository.name);

  // 2. PrismaService 주입
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // 3. 필수 메서드 구현 (AbstractRepository가 강제하는 메서드
  // 3-1. 생성 (Create)
  async create(data: Omit<User, 'id'>): Promise<User> {
    return this.prisma.user.create({
      data: data as Prisma.UserCreateInput,
    });
  }

  // 3-2. 단일 조회 (FindOne)
  async findOne(filterQuery: Prisma.UserWhereInput): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: filterQuery,
    });

    //핵심: 부모 클래스의 헬퍼 함수 사용
    // 데이터가 없으면 자동으로 404 NotFoundException을 던져줌!
    this.checkFound(user, 'User');

    return user!;
  }

  // 3-3. 수정 (Update)
  async findOneAndUpdate(
    filterQuery: Prisma.UserWhereUniqueInput,
    update: Partial<User>,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: filterQuery,
      data: update as Prisma.UserUpdateInput,
    });

    this.checkFound(user, 'User');
    return user;
  }

  // 3-4. 목록 조회 (Find)
  async find(filterQuery: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({
      where: filterQuery,
    });
  }
}
