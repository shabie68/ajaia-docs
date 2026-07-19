import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { SharesModule } from './shares/shares.module';

@Module({
  imports: [DocumentsModule, SharesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}