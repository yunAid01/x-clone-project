import { Module } from '@nestjs/common';
import { TwitController } from './twit.controller';
import { TwitService } from './twit.service';
import { TwitRepository } from './twit.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { RmqModule, RmqPublisher, RmqService } from '@repo/common';

@Module({
  imports: [
    PrismaModule,
    UserProfileModule,
    RmqModule.register({ name: 'TWIT' }),
  ],
  controllers: [TwitController],
  providers: [TwitService, TwitRepository, RmqService, RmqPublisher],
  exports: [TwitRepository],
})
export class TwitModule {}
