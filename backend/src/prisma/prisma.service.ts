/** for locall
 * import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
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
 * 
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    console.log('VERCEL =', process.env.VERCEL);
  console.log('NODE_ENV =', process.env.NODE_ENV);
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // PostgreSQL (Supabase)
      console.log("USING POSTSQL")
      super();
    } else {
      // Local SQLite
      const adapter = new PrismaBetterSqlite3({
        url: 'file:./prisma/dev.db',
      });

      super({ adapter });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}