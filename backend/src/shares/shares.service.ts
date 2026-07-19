import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShareDocumentDto } from './dto/share-document.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { RemoveShareDto } from './dto/remove-share.dto';

@Injectable()
export class SharesService {
  constructor(private prisma: PrismaService) {}

  async share(dto: ShareDocumentDto) {
    // 1. Find the user to share with by email
    const userToShareWith = await this.prisma.user.findUnique({
      where: { email: dto.userEmail },
      select: { id: true },
    });

    if (!userToShareWith) {
      throw new NotFoundException('User to share with not found');
    }

    // 2. Check if document exists
    const doc = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Don't allow sharing with the owner
    if (doc.ownerId === userToShareWith.id) {
      throw new BadRequestException('Cannot share document with the owner');
    }

    // 3. Upsert the share (create if not exists, update permission if it does)
    const share = await this.prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: dto.documentId,
          userId: userToShareWith.id,
        },
      },
      create: {
        documentId: dto.documentId,
        userId: userToShareWith.id,
        permission: dto.permission,
      },
      update: {
        permission: dto.permission,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return {
      userId: share.user.id,
      name: share.user.name,
      email: share.user.email,
      avatar: share.user.avatar,
      permission: share.permission,
    };
  }

  async updatePermission(dto: UpdateShareDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.userEmail },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const share = await this.prisma.documentShare.findUnique({
      where: {
        documentId_userId: {
          documentId: dto.documentId,
          userId: user.id,
        },
      },
    });

    if (!share) throw new NotFoundException('Share not found');

    await this.prisma.documentShare.update({
      where: {
        documentId_userId: {
          documentId: dto.documentId,
          userId: user.id,
        },
      },
      data: { permission: dto.permission },
    });

    return { success: true, message: 'Permission updated' };
  }

  async remove(dto: RemoveShareDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.userEmail },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.documentShare.deleteMany({
      where: {
        documentId: dto.documentId,
        userId: user.id,
      },
    });

    return { success: true, message: 'Share removed' };
  }
}