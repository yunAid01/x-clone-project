import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, PRISMA_ERRORS } from '@repo/common';
import { PrismaService } from './prisma/prisma.service';
import { User, Prisma } from '@prisma/client-auth';

@Injectable()
export class AuthRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Omit<User, 'userId' | 'createdAt'>): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data: data as Prisma.UserCreateInput,
      });
      this.logger.log(`Created new User: ${newUser.email}`);
      return newUser;
    } catch (error: any) {
      this.logger.error(`Error creating User: ${error.message}`);
      throw error;
    }
  }

  async findOne(filterQuery: Prisma.UserWhereInput): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({ where: filterQuery });
      return user as User;
    } catch (error: any) {
      console.error(error);
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND)
        this.ensureExists(null, 'User');
      throw error;
    }
  }

  async findOneAndUpdate(
    filterQuery: Prisma.UserWhereUniqueInput,
    update: Partial<User>,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: filterQuery,
        data: update as Prisma.UserUpdateInput,
      });
      return user;
    } catch (error: any) {
      if (error.code === PRISMA_ERRORS.RECORD_NOT_FOUND)
        this.ensureExists(null, 'User');
      throw error;
    }
  }

  async find(filterQuery: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({ where: filterQuery });
  }

  /**
   * 커스텀 메서드: 이메일로 유저 찾기 (없으면 null 반환)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
