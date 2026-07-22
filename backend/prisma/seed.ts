import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { hash } from 'bcryptjs' // ✅ Import hash function

// const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
// const prisma = new PrismaClient({ adapter })
const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_URL_NON_POOLING!,
})

const prisma = new PrismaClient({adapter})

async function main() {
  // Clean up
  await prisma.document.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.user.deleteMany();

  // Hash the password "password123" for our mock users
  const hashedPassword = await hash('password123', 12);

  const alice = await prisma.user.create({
    data: {
      id: 'alice',
      email: 'alice@ajaia.test',
      name: 'Alice Johnson',
      password: hashedPassword, // ✅ Store hashed password
      avatar: '#4F46E5',
    },
  })

  const bob = await prisma.user.create({
    data: {
      id: 'bob',
      email: 'bob@ajaia.test',
      name: 'Bob Smith',
      password: hashedPassword, // ✅ Store hashed password
      avatar: '#059669',
    },
  })

  const carol = await prisma.user.create({
    data: {
      id: 'carol',
      email: 'carol@ajaia.test',
      name: 'Carol Davis',
      password: hashedPassword, // ✅ Store hashed password
      avatar: '#DC2626',
    },
  })

  const doc = await prisma.document.create({
    data: {
      title: 'Project Requirements',
      content: JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph' }],
      }),
      ownerId: alice.id,
    },
  })

  await prisma.documentShare.create({
    data: {
      documentId: doc.id,
      userId: bob.id,
      permission: 'edit',
    },
  })

  console.log('✅ Seeded database with passwords!');
  console.log(`   - Try logging in as: alice@ajaia.test / password123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())