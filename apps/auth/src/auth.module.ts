import { Module } from '@nestjs/common';
import { AppController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
// import { PrismaModule } from '@repo/database';
// Replace the above line with the correct import based on what '@repo/database' exports.
// For example, if it exports 'DatabaseModule', use:
import { DatabaseModule } from '@repo/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AuthService],
})
export class AuthModule {}
