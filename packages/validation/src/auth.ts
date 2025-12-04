// packages/validation/src/auth.ts
import { z } from 'zod';

//req.user 타입 정의(@User() 데코레이터에서 사용)
export type AuthenticatedUser = {
  userId: string;
  email: string;
};

// 1. 회원가입 스키마 정의
export const registerSchema = z.object({
  email: z.string().email({ message: '이메일 형식이 올바르지 않습니다.' }),
  password: z
    .string()
    .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
    .max(20, { message: '비밀번호는 20자를 초과할 수 없습니다.' }),
  nickname: z.string().min(2, { message: '이름은 2글자 이상이어야 합니다.' }),
});
export const loginSchema = z.object({
  email: z.string().email({ message: '이메일 형식이 올바르지 않습니다.' }),
  password: z
    .string()
    .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' }),
});

// 2. 타입 추출 (NestJS DTO에서 쓰기 위함)
export type RegisterDtoType = z.infer<typeof registerSchema>;
export type LoginDtoType = z.infer<typeof loginSchema>;
