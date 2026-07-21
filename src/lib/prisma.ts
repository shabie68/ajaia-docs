
//  // For locally it work fine
//   import { PrismaClient } from '@prisma/client'
//  import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

//  const globalForPrisma = globalThis as unknown as {
//    prisma: PrismaClient | undefined
//  }

//  let prisma: PrismaClient

//  try {
//    const adapter = new PrismaBetterSqlite3({ 
//      url: process.env.DATABASE_URL || 'file:./prisma/dev.db' 
//    })
//    prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
//  } catch (error) {
//    // Fails during 'next build' on Vercel because the local file doesn't exist.
//    // We assign a dummy object so the build finishes successfully.
//    prisma = {} as PrismaClient
//  }

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

console.log(
  "POSTGRES_PRISMA_URL:",
  process.env.POSTGRES_PRISMA_URL?.substring(0, 80)
)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL!,
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

  
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}