import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
// const prisma = new PrismaClient();

// We test the database logic directly to avoid complex API mocking in a timebox
// This validates the core persistence and sharing constraints
describe('Document and Sharing Logic', () => {
  let userId1: string;
  let userId2: string;
  let documentId: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: { email: 'test-user1@ajaia.test', name: 'Test User 1', avatar: '#000' },
    });
    const user2 = await prisma.user.create({
      data: { email: 'test-user2@ajaia.test', name: 'Test User 2', avatar: '#FFF' },
    });
    userId1 = user1.id;
    userId2 = user2.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.documentShare.deleteMany({ where: { userId: { in: [userId1, userId2] } } });
    await prisma.document.deleteMany({ where: { ownerId: { in: [userId1, userId2] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userId1, userId2] } } });
    await prisma.$disconnect();
  });

  it('should create a document with valid data', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Test Document',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: userId1,
      },
    });

    documentId = doc.id;
    expect(doc.id).toBeDefined();
    expect(doc.title).toBe('Test Document');
    expect(doc.createdAt).toBeDefined();
  });

  it('should share a document with another user', async () => {
    const share = await prisma.documentShare.create({
      data: {
        documentId,
        userId: userId2,
        permission: 'edit',
      },
    });

    expect(share.id).toBeDefined();
    expect(share.permission).toBe('edit');
  });

  it('should prevent duplicate shares (unique constraint)', async () => {
    await expect(
      prisma.documentShare.create({
        data: {
          documentId,
          userId: userId2,
          permission: 'view',
        },
      })
    ).rejects.toThrow();
  });

  it('should fetch shared documents correctly', async () => {
    const sharedDocs = await prisma.document.findMany({
      where: {
        shares: { some: { userId: userId2 } },
      },
      include: { owner: true },
    });

    expect(sharedDocs.length).toBe(1);
    expect(sharedDocs[0].owner.email).toBe('test-user1@ajaia.test');
  });
});