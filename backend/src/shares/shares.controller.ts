import { Controller, Post, Patch, Delete, Body } from '@nestjs/common';
import { SharesService } from './shares.service';
import { ShareDocumentDto } from './dto/share-document.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { RemoveShareDto } from './dto/remove-share.dto';

@Controller('documents/share')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  share(@Body() dto: ShareDocumentDto) {
    return this.sharesService.share(dto);
  }

  @Patch()
  updatePermission(@Body() dto: UpdateShareDto) {
    return this.sharesService.updatePermission(dto);
  }

  @Delete()
  remove(@Body() dto: RemoveShareDto) {
    return this.sharesService.remove(dto);
  }
}