import { twitSchema } from '@repo/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateTwitDto extends createZodDto(twitSchema) {}
