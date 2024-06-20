import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CollectiveWorksService } from './collective-works.service';
import { CreateCollectiveWorkDto } from './dto/create-collective-work.dto';
import { UpdateCollectiveWorkDto } from './dto/update-collective-work.dto';

@Controller('collective-works')
export class CollectiveWorksController {
  constructor(
    private readonly collectiveWorksService: CollectiveWorksService,
  ) {}

  @Post()
  create(@Body() createCollectiveWorkDto: CreateCollectiveWorkDto) {
    return this.collectiveWorksService.create(createCollectiveWorkDto);
  }

  @Get()
  findAll() {
    return this.collectiveWorksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectiveWorksService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollectiveWorkDto: UpdateCollectiveWorkDto,
  ) {
    return this.collectiveWorksService.update(+id, updateCollectiveWorkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectiveWorksService.remove(+id);
  }
}
