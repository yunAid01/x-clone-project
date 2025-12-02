import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    let user;
    if (ctx.getType() === 'http') {
      user = ctx.switchToHttp().getRequest().user;
    } else if (ctx.getType() === 'rpc') {
      user = ctx.switchToRpc().getData().user;
    }
    return user;
  },
);
