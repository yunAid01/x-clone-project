import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-user';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected to the database successfully.');
    } catch (error) {
      console.error('Error connecting to the database with Prisma:', error);
    }
  }
}
