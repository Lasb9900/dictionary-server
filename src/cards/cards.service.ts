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
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateAuthorCardDto } from './dto/update-author-card.dto';
import { UpdateMagazineCardDto } from './dto/update-magazine-card.dto';
import { UpdateAnthologyCardDto } from './dto/update-anthology-card.dto';
import { UpdateGroupingCardDto } from './dto/update-grouping-card.dto';
import { QueryRepository } from '../neo4j/query.repository';

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
    private readonly queryRepository: QueryRepository,
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

  async updateCard(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    try {
      const updatedCard = await this.cardModel.findByIdAndUpdate(
        id,
        updateCardDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card. Please try again later.');
    }
  }

  async updateAuthorCardContent(
    id: string,
    updateCardDto: UpdateAuthorCardDto,
  ): Promise<Card> {
    try {
      const updatedCard = await this.authorCardModel.findByIdAndUpdate(
        id,
        updateCardDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card. Please try again later.');
    }
  }

  async updateMagazineCardContent(
    id: string,
    updateCardDto: UpdateMagazineCardDto,
  ): Promise<Card> {
    try {
      const updatedCard = await this.magazineCardModel.findByIdAndUpdate(
        id,
        updateCardDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card. Please try again later.');
    }
  }

  async updateAnthologyCardContent(
    id: string,
    updateCardDto: UpdateAnthologyCardDto,
  ): Promise<Card> {
    try {
      const updatedCard = await this.anthologyCardModel.findByIdAndUpdate(
        id,
        updateCardDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card. Please try again later.');
    }
  }

  async updateGroupingCardContent(
    id: string,
    updateCardDto: UpdateGroupingCardDto,
  ): Promise<Card> {
    try {
      const updatedCard = await this.groupingCardModel.findByIdAndUpdate(
        id,
        updateCardDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card. Please try again later.');
    }
  }

  async uploadAuthorCard(
    id: string,
    updateCardDto: UpdateAuthorCardDto,
  ): Promise<AuthorCard> {
    const session = await this.authorCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.authorCardModel.findByIdAndUpdate(
        id,
        updateCardDto,
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createAuthorCardNodes({
        ...updateCardDto,
        id,
      });

      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async uploadMagazineCard(
    id: string,
    updateMagazineCardDto: UpdateMagazineCardDto,
  ): Promise<MagazineCard> {
    const session = await this.magazineCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.magazineCardModel.findByIdAndUpdate(
        id,
        updateMagazineCardDto,
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new Error('Magazine card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createMagazineCardNodes({
        ...updateMagazineCardDto,
        id,
      });

      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async uploadAnthologyCard(
    id: string,
    updateAnthologyCardDto: UpdateAnthologyCardDto,
  ): Promise<AnthologyCard> {
    const session = await this.anthologyCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.anthologyCardModel.findByIdAndUpdate(
        id,
        updateAnthologyCardDto,
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new Error('Anthology card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createAnthologyCardNodes({
        ...updateAnthologyCardDto,
        id,
      });

      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async uploadGroupingCard(
    id: string,
    updateGroupingCardDto: UpdateGroupingCardDto,
  ): Promise<GroupingCard> {
    const session = await this.groupingCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.groupingCardModel.findByIdAndUpdate(
        id,
        updateGroupingCardDto,
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new Error('Grouping card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createGroupingCardNodes({
        ...updateGroupingCardDto,
        id,
      });

      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Transaction failed: ${error.message}`);
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
