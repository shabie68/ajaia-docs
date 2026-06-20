import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@ajaia.test' },
    update: {},
    create: {
      email: 'alice@ajaia.test',
      name: 'Alice Johnson',
      avatar: '#4F46E5',
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@ajaia.test' },
    update: {},
    create: {
      email: 'bob@ajaia.test',
      name: 'Bob Smith',
      avatar: '#059669',
    },
  })

  const carol = await prisma.user.upsert({
    where: { email: 'carol@ajaia.test' },
    update: {},
    create: {
      email: 'carol@ajaia.test',
      name: 'Carol Davis',
      avatar: '#DC2626',
    },
  })

  const doc = await prisma.document.create({
    data: {
      title: 'Project Requirements',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Project Requirements' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', text: 'sample document', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' to demonstrate the editor.' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Feature one' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Feature two' }] }],
              },
            ],
          },
        ],
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

  console.log('✅ Seeded database with:')
  console.log(`   - Users: ${alice.email}, ${bob.email}, ${carol.email}`)
  console.log(`   - Sample document: "${doc.title}" (shared with Bob)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())