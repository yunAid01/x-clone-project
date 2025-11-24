import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('PrismaService connected to the database');
    } catch (error) {
      console.error('Error connecting to the database', error);
      console.log(`Error Message: ${error.message}`);
    }
  }
}
