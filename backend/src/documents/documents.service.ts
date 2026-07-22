import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true, email: true, name: true, avatar: true }
    });

    if (!user) throw new NotFoundException('User not found');

    const owned = await this.prisma.document.findMany({
      where: { ownerId: user.id },
      select: {
        id: true, title: true, content: true, createdAt: true, updatedAt: true,
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          select: {
            userId: true, permission: true,
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const shared = await this.prisma.document.findMany({
      where: { shares: { some: { userId: user.id } }, ownerId: { not: user.id } },
      select: {
        id: true, title: true, content: true, createdAt: true, updatedAt: true,
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: { where: { userId: user.id }, select: { permission: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      owned,
      shared: shared.map((doc) => ({ ...doc, permission: doc.shares[0]?.permission || 'view' })),
    };
  }

  async findOne(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: {
        id: true, title: true, content: true, createdAt: true, updatedAt: true, ownerId: true,
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          select: {
            userId: true, permission: true,
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!doc) throw new NotFoundException('Document not found');

    // Check if user has access
    const isOwner = doc.ownerId === userId;
    const hasShare = doc.shares.some(s => s.userId === userId);
    
    if (!isOwner && !hasShare) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return doc;
  }

  async create(dto: CreateDocumentDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ id: dto.userId }, { email: dto.userId }] },
      select: { id: true }
    });

    if (!user) throw new NotFoundException('User not found');

    return this.prisma.document.create({
      data: {
        title: dto.title || 'Untitled Document',
        // ✅ Use provided content, otherwise default to empty paragraph
        content: dto.content || JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: user.id,
      },
      select: { id: true, title: true, content: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
      select: { id: true, title: true, content: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    await this.prisma.document.delete({ where: { id } });
    return { success: true, message: 'Document deleted' };
  }
}