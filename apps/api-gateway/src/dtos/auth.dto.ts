import { createZodDto } from 'nestjs-zod';

import { registerSchema, loginSchema } from '@repo/validation';

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
