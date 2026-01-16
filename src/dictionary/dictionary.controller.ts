import { Body, Controller, Post } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { DefineTermDto } from './dto/define-term.dto';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post('define')
  async defineTerm(@Body() dto: DefineTermDto) {
    return this.dictionaryService.defineTerm(dto);
  }
}
