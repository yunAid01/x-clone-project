import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 1. 모듈이 초기화될 때 DB에 연결
  async onModuleInit() {
    await this.$connect();
  }

  // 2. 모듈이 파괴될 때(서버 꺼질 때) 연결 해제
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
