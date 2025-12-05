import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Ssagazi, SsagaziContainer, toRpcException } from '@repo/common';
import { RmqPublisher } from '@repo/common';
import { AuthRepository } from './auth.repository';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs'; // 👈 추가

@Injectable()
export class AuthService implements SsagaziContainer {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    public readonly publisher: RmqPublisher,
    private readonly authRepository: AuthRepository,
    @Inject('USER') private readonly userClient: ClientProxy,
  ) {}

  @Ssagazi({
    successMessage: 'auth.created',
    successData: (res, args) => ({
      userId: res.userId,
      email: args[0].email,
      nickname: args[0].nickname,
    }),
    failureMessage: 'auth.creation_failed',
    failureData: (err, args) => ({
      data: args,
      reason: err.message,
    }),
  })
  async userRegister(data: any) {
    const { email, password, nickname } = data;
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      this.logger.debug(`Attempt to register with existing email: ${email}`);
      throw new BadRequestException('register Error: Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.authRepository.create({
      email,
      password: hashedPassword,
      nickname,
      role: 'USER', // default
    });
    return {
      statusCode: 201,
      userId: newUser.userId,
      message: 'successfully registered',
    };
  }

  async rollbackUserRegister(data) {
    this.logger.warn(
      `Rollback userRegister triggered with data: ${JSON.stringify(data)}`,
    );
    // Implement rollback logic here, e.g., delete the user if created
    await this.authRepository.delete({ email: data.email });
    this.logger.log(
      `Rollback successful for userRegister with email: ${data.email}`,
    );
  }

  async userLogin(data: any) {
    const { email, password } = data;
    const existingUser = await this.authRepository.findByEmail(email);
    if (!existingUser) {
      throw new BadRequestException('login Error: Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('login Error: Invalid credentials');
    }
    const token = this.jwtService.sign({
      userId: existingUser.userId,
      email: existingUser.email,
    });

    // 👇 Observable을 Promise로 변환
    const userProfile = await lastValueFrom(
      this.userClient.send('loginUserProfile', {
        userId: existingUser.userId,
      }),
    );

    return {
      statusCode: 200,
      token: token,
      message: 'successfully logged in',
      userProfile: userProfile,
    };
  }
}
