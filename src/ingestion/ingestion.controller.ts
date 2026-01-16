import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import {
  IngestionCardType,
  IngestionWorksheetDto,
} from './dto/ingestion-worksheet.dto';
import { IngestionAutoDto } from './dto/ingestion-auto.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('worksheet')
  async createWorksheet(@Body() dto: IngestionWorksheetDto) {
    return this.ingestionService.createWorksheet(dto);
  }

  @Post(':type/:id/save')
  async saveCardPayload(
    @Param('type', new ParseEnumPipe(IngestionCardType))
    type: IngestionCardType,
    @Param('id') id: string,
    @Body() payload: Record<string, any>,
  ) {
    return this.ingestionService.saveByType(type, id, payload);
  }

  @Post(':type/:id/auto-review')
  async autoReview(
    @Param('type', new ParseEnumPipe(IngestionCardType))
    type: IngestionCardType,
    @Param('id') id: string,
  ) {
    return this.ingestionService.autoReview(type, id);
  }

  @Post(':type/:id/auto-upload')
  async autoUpload(
    @Param('type', new ParseEnumPipe(IngestionCardType))
    type: IngestionCardType,
    @Param('id') id: string,
  ) {
    return this.ingestionService.autoUpload(type, id);
  }

  @Post(':type/auto')
  async autoOrchestrate(
    @Param('type', new ParseEnumPipe(IngestionCardType))
    type: IngestionCardType,
    @Query('id') id: string | undefined,
    @Body() dto: IngestionAutoDto,
  ) {
    return this.ingestionService.autoOrchestrate(
      type,
      id,
      dto.payload,
      dto.options,
      dto.worksheet,
    );
  }
}
