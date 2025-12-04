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
import { toRpcException } from '@repo/common';
import { RmqPublisher } from '@repo/common';
import { AuthRepository } from './auth.repository';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs'; // 👈 추가

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly publisher: RmqPublisher,
    private readonly authRepository: AuthRepository,
    @Inject('USER') private readonly userClient: ClientProxy,
  ) {}

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
    this.publisher.publish('user.created', {
      userId: newUser.userId,
      email: newUser.email,
      nickname: newUser.nickname,
    });
    return { statusCode: 201, message: 'successfully registered' };
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
