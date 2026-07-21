import 'dotenv/config'

export default {
  schema: 'prisma/schema.prisma',

  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING,
  },

  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
}