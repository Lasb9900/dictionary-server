import {
  Body,
  Controller,
  Headers,
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
import { AI_PROVIDER_HEADER } from '../ai/ai.constants';
import { normalizeAiProvider } from '../ai/ai.utils';
import { IngestionSaveDto } from './dto/ingestion-save.dto';

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
    @Body() dto: IngestionSaveDto,
  ) {
    return this.ingestionService.saveByType(type, id, dto.payload);
  }

  @Post(':type/:id/auto-review')
  async autoReview(
    @Param('type', new ParseEnumPipe(IngestionCardType))
    type: IngestionCardType,
    @Param('id') id: string,
    @Headers(AI_PROVIDER_HEADER) providerHeader?: string,
  ) {
    const providerOverride = normalizeAiProvider(providerHeader);
    return this.ingestionService.autoReview(type, id, {
      providerOverride,
    });
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
    @Headers(AI_PROVIDER_HEADER) providerHeader?: string,
  ) {
    const providerOverride = normalizeAiProvider(providerHeader);
    return this.ingestionService.autoOrchestrate(
      type,
      id,
      dto.payload ?? {},
      {
        ...dto.options,
        providerOverride,
      },
      dto.worksheet,
    );
  }

  @Post(':type/:id/auto-orchestrate')
  async autoOrchestrateById(
    @Param('type', new ParseEnumPipe(IngestionCardType))
    type: IngestionCardType,
    @Param('id') id: string,
    @Body() dto: IngestionAutoDto,
    @Headers(AI_PROVIDER_HEADER) providerHeader?: string,
  ) {
    const providerOverride = normalizeAiProvider(providerHeader);
    return this.ingestionService.autoOrchestrate(
      type,
      id,
      dto.payload ?? {},
      {
        ...dto.options,
        providerOverride,
      },
      dto.worksheet,
    );
  }
}
