import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Share a document with a user
export async function POST(request: NextRequest) {
  try {
    const { documentId, userEmail, permission } = await request.json();

    if (!documentId || !userEmail) {
      return NextResponse.json({ error: 'documentId and userEmail are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Don't share with owner
    if (document.ownerId === user.id) {
      return NextResponse.json({ error: 'Cannot share document with owner' }, { status: 400 });
    }

    const share = await prisma.documentShare.create({
      data: {
        documentId,
        userId: user.id,
        permission: permission || 'view',
      },
      include: { user: true },
    });

    return NextResponse.json({
      userId: share.user.id,
      name: share.user.name,
      email: share.user.email,
      avatar: share.user.avatar,
      permission: share.permission,
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Document already shared with this user' }, { status: 409 });
    }
    console.error('POST /api/documents/share error:', error);
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 });
  }
}

// PATCH - Update share permission
export async function PATCH(request: NextRequest) {
  try {
    const { documentId, userEmail, permission } = await request.json();

    if (!documentId || !userEmail || !permission) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const share = await prisma.documentShare.findUnique({
      where: {
        documentId_userId: { documentId, userId: user.id },
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const updated = await prisma.documentShare.update({
      where: { id: share.id },
      data: { permission },
      include: { user: true },
    });

    return NextResponse.json({
      userId: updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      avatar: updated.user.avatar,
      permission: updated.permission,
    });
  } catch (error) {
    console.error('PATCH /api/documents/share error:', error);
    return NextResponse.json({ error: 'Failed to update share' }, { status: 500 });
  }
}

// DELETE - Remove share
export async function DELETE(request: NextRequest) {
  try {
    const { documentId, userEmail } = await request.json();

    if (!documentId || !userEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.documentShare.delete({
      where: {
        documentId_userId: { documentId, userId: user.id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/documents/share error:', error);
    return NextResponse.json({ error: 'Failed to remove share' }, { status: 500 });
  }
}