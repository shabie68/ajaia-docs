import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsGateway } from './documents.gateway';

@Module({
  imports: [PrismaModule], // ✅ Import database access
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsGateway],
})
export class DocumentsModule {}