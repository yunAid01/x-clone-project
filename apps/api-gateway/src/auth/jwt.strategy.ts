// apps/api-gateway/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecretKey = configService.get<string>('JWT_SECRET_KEY');
    if (!jwtSecretKey) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecretKey,
    });
  }

  // 토큰 검증 성공하면 이 함수가 실행됨
  async validate(payload: any) {
    // payload에는 { userId: 1, email: '...' } 같은 게 들어있음
    return { userId: payload.userId, email: payload.email };
    // 리턴된 값은 request.user 에 자동으로 꽂힘! ✨
  }
}
