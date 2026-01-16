import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { DictionaryAskDto } from './dto/dictionary-ask.dto';
import { Auth } from '../users/decorators/auth.decorators';
import { UserRoles } from '../users/interfaces/user-roles.interface';
import { AI_PROVIDER_HEADER } from '../ai/ai.constants';
import { normalizeAiProvider } from '../ai/ai.utils';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post(':id/ask')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.RESEARCHER)
  async ask(
    @Param('id') id: string,
    @Body() dto: DictionaryAskDto,
    @Headers(AI_PROVIDER_HEADER) providerHeader?: string,
  ) {
    const providerOverride = normalizeAiProvider(providerHeader);
    return this.dictionaryService.ask(id, dto.question, providerOverride);
  }
}
