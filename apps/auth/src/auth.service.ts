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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly publisher: RmqPublisher,
    private readonly authRepository: AuthRepository,
  ) {}

  @toRpcException()
  async userRegister(data: any) {
    const { email, password, name } = data;
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Attempt to register with existing email: ${email}`);
      throw new BadRequestException('register Error: Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.authRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'USER', // default
      createdAt: new Date(),
    });
    this.publisher.publish('user.created', {
      userId: newUser.id,
      email: newUser.email,
      nickname: newUser.name,
    });
    return { statusCode: 201, message: 'successfully registered' };
  }

  @toRpcException()
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
      userId: existingUser.id,
      email: existingUser.email,
    });
    return {
      statusCode: 200,
      token: token,
      message: 'successfully logged in',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    };
  }
}
