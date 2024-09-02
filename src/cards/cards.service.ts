import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorCard } from './entities/author.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { AnthologyCard } from './entities/anthology.entity';
import { MagazineCard } from './entities/magazine.entity';
import { GroupingCard } from './entities/grouping.entity';
import { Card } from './entities/card.entity';
import { CardStatus } from './interfaces/card-status.interface';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<Card>,
    @InjectModel(AuthorCard.name)
    private readonly authorCardModel: Model<AuthorCard>,
    @InjectModel(AnthologyCard.name)
    private readonly anthologyCardModel: Model<AnthologyCard>,
    @InjectModel(MagazineCard.name)
    private readonly magazineCardModel: Model<MagazineCard>,
    @InjectModel(GroupingCard.name)
    private readonly groupingCardModel: Model<GroupingCard>,
  ) {}

  async createCard(createCardDto: CreateCardDto): Promise<Card> {
    const { type, ...data } = createCardDto;
    let createdCard;

    try {
      switch (type) {
        case 'author':
          createdCard = new this.authorCardModel(data);
          break;
        case 'anthology':
          createdCard = new this.anthologyCardModel(data);
          break;
        case 'magazine':
          createdCard = new this.magazineCardModel(data);
          break;
        case 'grouping':
          createdCard = new this.groupingCardModel(data);
          break;
        default:
          throw new Error('Invalid card type');
      }

      return await createdCard.save();
    } catch (error) {
      console.error('Error creating card:', error);
      throw new Error('Failed to create card. Please try again later.');
    }
  }

  async findAllCards(): Promise<Card[]> {
    return await this.cardModel
      .find()
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllPendingEditCards(): Promise<Card[]> {
    return await this.cardModel
      .find({
        status: CardStatus.PENDING_EDIT,
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllPendingReviewCards(): Promise<Card[]> {
    return await this.cardModel
      .find({
        status: CardStatus.PENDING_REVIEW,
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllValidatedCards(): Promise<Card[]> {
    return await this.cardModel
      .find({
        status: CardStatus.VALIDATED,
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllByUser(userId: string): Promise<Card[]> {
    return await this.cardModel
      .find({
        $or: [{ assignedEditors: userId }, { assignedReviewers: userId }],
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllByEditor(userId: string): Promise<Card[]> {
    return await this.cardModel
      .find({
        assignedEditors: userId,
        status: CardStatus.PENDING_EDIT,
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllByReviewer(userId: string): Promise<Card[]> {
    return await this.cardModel
      .find({
        assignedReviewers: userId,
        status: CardStatus.PENDING_REVIEW,
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }

  async findAllValidatedCardsByUser(userId: string): Promise<Card[]> {
    return await this.cardModel
      .find({
        $and: [
          {
            $or: [{ assignedEditors: userId }, { assignedReviewers: userId }],
          },
          {
            status: CardStatus.VALIDATED,
          },
        ],
      })
      .populate('assignedEditors', '_id fullName email imageUrl')
      .populate('assignedReviewers', '_id fullName email imageUrl')
      .exec();
  }
}
