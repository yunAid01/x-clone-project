import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // 👈 전역 모듈로 설정 (한 번 import하면 앱 전체에서 사용 가능)
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 외부에서 PrismaService를 쓸 수 있게 내보냄
})
export class DatabaseModule {}
