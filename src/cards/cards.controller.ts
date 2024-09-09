import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from './entities/card.entity';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateAnthologyCardDto } from './dto/update-anthology-card.dto';
import { UpdateAuthorCardDto } from './dto/update-author-card.dto';
import { UpdateGroupingCardDto } from './dto/update-grouping-card.dto';
import { UpdateMagazineCardDto } from './dto/update-magazine-card.dto';
import { AuthorCard } from './entities/author.entity';
import { MagazineCard } from './entities/magazine.entity';
import { AnthologyCard } from './entities/anthology.entity';
import { GroupingCard } from './entities/grouping.entity';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardsService.createCard(createCardDto);
  }

  @Get()
  async findAllCards(): Promise<Card[]> {
    return this.cardsService.findAllCards();
  }

  @Put(':id')
  async updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.updateCard(id, updateCardDto);
  }

  @Put('author/:id')
  async updateAuthorCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAuthorCardDto,
  ): Promise<Card> {
    return this.cardsService.updateAuthorCardContent(id, updateCardDto);
  }

  @Put('magazine/:id')
  async updateMagazineCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateMagazineCardDto,
  ): Promise<Card> {
    return this.cardsService.updateMagazineCardContent(id, updateCardDto);
  }

  @Put('anthology/:id')
  async updateAnthologyCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAnthologyCardDto,
  ): Promise<Card> {
    return this.cardsService.updateAnthologyCardContent(id, updateCardDto);
  }

  @Put('grouping/:id')
  async updateGroupingCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateGroupingCardDto,
  ): Promise<Card> {
    return this.cardsService.updateGroupingCardContent(id, updateCardDto);
  }

  @Put('upload/author/:id')
  async uploadAuthorCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAuthorCardDto,
  ): Promise<AuthorCard> {
    return this.cardsService.uploadAuthorCard(id, updateCardDto);
  }

  @Put('upload/magazine/:id')
  async uploadMagazineCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateMagazineCardDto,
  ): Promise<MagazineCard> {
    return this.cardsService.uploadMagazineCard(id, updateCardDto);
  }

  @Put('upload/anthology/:id')
  async uploadAnthologyCard(
    @Param('id') id: string,
    @Body() updateAnthologyCardDto: UpdateAnthologyCardDto,
  ): Promise<AnthologyCard> {
    return this.cardsService.uploadAnthologyCard(id, updateAnthologyCardDto);
  }

  @Put('upload/grouping/:id')
  async uploadGroupingCard(
    @Param('id') id: string,
    @Body() updateGroupingCardDto: UpdateGroupingCardDto,
  ): Promise<GroupingCard> {
    return this.cardsService.uploadGroupingCard(id, updateGroupingCardDto);
  }

  @Get('status/pending-edit')
  async findAllPendingEditCards(): Promise<Card[]> {
    return this.cardsService.findAllPendingEditCards();
  }

  @Get('status/pending-review')
  async findAllPendingReviewCards(): Promise<Card[]> {
    return this.cardsService.findAllPendingReviewCards();
  }

  @Get('status/validated')
  async findAllValidatedCards(): Promise<Card[]> {
    return this.cardsService.findAllValidatedCards();
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string): Promise<Card[]> {
    return this.cardsService.findAllByUser(userId);
  }

  @Get('user/:userId/editor')
  async findAllByEditor(@Param('userId') userId: string): Promise<Card[]> {
    return this.cardsService.findAllByEditor(userId);
  }

  @Get('user/:userId/reviewer')
  async findAllByReviewer(@Param('userId') userId: string): Promise<Card[]> {
    return this.cardsService.findAllByReviewer(userId);
  }

  @Get('user/:userId/validated')
  async findAllValidatedCardsByUser(
    @Param('userId') userId: string,
  ): Promise<Card[]> {
    return this.cardsService.findAllValidatedCardsByUser(userId);
  }
}
