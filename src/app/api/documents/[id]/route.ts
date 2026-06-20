import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/documents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: true,
        shares: { include: { user: true } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      owner: {
        id: document.owner.id,
        name: document.owner.name,
        email: document.owner.email,
        avatar: document.owner.avatar,
      },
      sharedWith: document.shares.map((s) => ({
        userId: s.user.id,
        name: s.user.name,
        email: s.user.email,
        avatar: s.user.avatar,
        permission: s.permission,
      })),
    });
  } catch (error) {
    console.error('GET /api/documents/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

// PATCH /api/documents/[id] - Update title or content
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('PATCH /api/documents/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.documentShare.deleteMany({ where: { documentId: id } });
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/documents/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}