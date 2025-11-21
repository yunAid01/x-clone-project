// 1. 우리가 만든 모듈과 서비스 내보내기
export * from './prisma.module.js';
export * from './prisma.service.js';

// 2. Prisma가 자동으로 만든 타입(User, Role 등)도 같이 내보내기
// 이렇게 하면 앱에서 `import { User } from '@repo/database'` 처럼 쓸 수 있습니다.
export * from '@prisma/client';
