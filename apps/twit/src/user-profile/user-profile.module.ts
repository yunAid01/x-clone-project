import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { UserProfileRepository } from './user-profile.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { RmqModule, RmqService } from '@repo/common';

@Module({
  imports: [PrismaModule, RmqModule.register({ name: 'TWIT' })],
  controllers: [UserProfileController],
  providers: [UserProfileService, UserProfileRepository, RmqService],
  exports: [UserProfileRepository],
})
export class UserProfileModule {}
