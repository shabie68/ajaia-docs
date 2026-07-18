import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/documents?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get owned documents
    const ownedDocuments = await prisma.document.findMany({
      where: { ownerId: user.id },
      include: {
        owner: true,
        shares: {
          include: { user: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get documents shared with this user
    const sharedDocuments = await prisma.document.findMany({
      where: {
        shares: {
          some: { userId: user.id },
        },
        ownerId: { not: user.id },
      },
      include: {
        owner: true,
        shares: {
          where: { userId: user.id },
          include: { user: true }, // Added missing user include here
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      owned: ownedDocuments.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        owner: { name: doc.owner?.name || 'Unknown', email: doc.owner?.email || '' },
        sharedWith: doc.shares.map((s) => ({
          userId: s.userId,
          name: s.user?.name || 'Unknown',
          email: s.user?.email || '',
          avatar: s.user?.avatar || null,
          permission: s.permission,
        })),
      })),
      shared: sharedDocuments.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        owner: { name: doc.owner?.name || 'Unknown', email: doc.owner?.email || '' },
        permission: doc.shares[0]?.permission || 'view',
      })),
    });
  } catch (error) {
    console.error('GET /api/documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content } = body;
    console.log("GLOBALL")
    console.log(body)

    if (!userId || !title) {
      return NextResponse.json({ error: 'userId and title are required' }, { status: 400 });
    }
    

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled Document',
        content: content || JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph' }],
        }),
        ownerId: user.id,
      },
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/documents error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}