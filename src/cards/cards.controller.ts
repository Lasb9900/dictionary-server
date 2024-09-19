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

  @Get('author/:id')
  async getAuthorCardById(@Param('id') id: string) {
    const fields =
      'fullName gender pseudonym dateOfBirth dateOfDeath placeOfBirth placeOfDeath relatives relevantActivities mainTheme mainGenre context multimedia works criticism';
    return this.cardsService.getCardById(id, 'author', fields);
  }

  @Get('magazine/:id')
  async getMagazineCardById(@Param('id') id: string) {
    const fields =
      'magazineTitle originalLanguage firstIssueDate lastIssueDate issuesPublished publicationPlace creators sections description multimedia criticism';
    return this.cardsService.getCardById(id, 'magazine', fields);
  }

  @Get('anthology/:id')
  async getAnthologyCardById(@Param('id') id: string) {
    const fields =
      'anthologyTitle genre author originalLanguage publicationDate publicationPlace description multimedia criticism';
    return this.cardsService.getCardById(id, 'anthology', fields);
  }

  @Get('grouping/:id')
  async getGroupingCardById(@Param('id') id: string) {
    const fields =
      'name meetingPlace startDate endDate generalCharacteristics members groupPublications groupActivities multimedia criticism';
    return this.cardsService.getCardById(id, 'grouping', fields);
  }

  @Put(':id')
  async updateCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardsService.updateCard(id, updateCardDto);
  }

  @Put('save/author/:id')
  async saveAuthorCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAuthorCardDto,
  ): Promise<Card> {
    return this.cardsService.saveAuthorCardContent(id, updateCardDto);
  }

  @Put('save/magazine/:id')
  async saveMagazineCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateMagazineCardDto,
  ): Promise<Card> {
    return this.cardsService.saveMagazineCardContent(id, updateCardDto);
  }

  @Put('save/anthology/:id')
  async saveAnthologyCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAnthologyCardDto,
  ): Promise<Card> {
    return this.cardsService.saveAnthologyCardContent(id, updateCardDto);
  }

  @Put('save/grouping/:id')
  async saveGroupingCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateGroupingCardDto,
  ): Promise<Card> {
    return this.cardsService.saveGroupingCardContent(id, updateCardDto);
  }

  @Put('update/author/:id')
  async updateAuthorCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAuthorCardDto,
  ): Promise<Card> {
    return this.cardsService.saveAuthorCardContent(id, updateCardDto);
  }

  @Put('update/magazine/:id')
  async updateMagazineCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateMagazineCardDto,
  ): Promise<Card> {
    return this.cardsService.saveMagazineCardContent(id, updateCardDto);
  }

  @Put('update/anthology/:id')
  async updateAnthologyCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateAnthologyCardDto,
  ): Promise<Card> {
    return this.cardsService.saveAnthologyCardContent(id, updateCardDto);
  }

  @Put('update/grouping/:id')
  async updateGroupingCard(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateGroupingCardDto,
  ): Promise<Card> {
    return this.cardsService.saveGroupingCardContent(id, updateCardDto);
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
