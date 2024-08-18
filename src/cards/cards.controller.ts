import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Auth } from 'src/users/decorators/auth.decorators';
import { UserRoles } from 'src/users/interfaces/user-roles.interface';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @Auth(UserRoles.ADMINISTRATOR)
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.EDITOR, UserRoles.REVIEWER)
  findAll(@GetUser() user: User) {
    return this.cardsService.findAll(user);
  }

  @Patch(':id')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.EDITOR)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @Auth(UserRoles.ADMINISTRATOR)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.cardsService.remove(id);
  }

  @Post('complete/:id')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.EDITOR)
  completeCard(@Param('id', ParseMongoIdPipe) id: string) {
    return this.cardsService.completeCard(id);
  }

  @Post('approve/:id')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.REVIEWER)
  approveCard(@Param('id', ParseMongoIdPipe) id: string) {
    return this.cardsService.approveCard(id);
  }

  @Post('reject/:id')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.REVIEWER)
  rejectCard(@Param('id', ParseMongoIdPipe) id: string) {
    return this.cardsService.rejectCard(id);
  }
}
