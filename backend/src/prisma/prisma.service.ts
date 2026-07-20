
 import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    console.log("HERE ARE WE")
    console.log(process.env.DATABASE_URL)
    // Point to the SAME database file as your Next.js app
    const adapter = new PrismaBetterSqlite3({ url: 'file:../prisma/dev.db' });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}