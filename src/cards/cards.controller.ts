import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from './entities/card.entity';

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
