import { z } from 'zod';

export const twitSchema = z.object({
  content: z
    .string()
    .min(1, { message: '트윗 내용은 최소 1자 이상이어야 합니다.' })
    .max(280, { message: '트윗 내용은 280자를 초과할 수 없습니다.' }),
});
export type TwitDtoType = z.infer<typeof twitSchema>;
