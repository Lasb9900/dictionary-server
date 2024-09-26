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
import { OpenaiService } from 'src/openai/openai.service';
import { userSummaryPrompt } from 'src/openai/prompts/user-summary';
import { workSummaryPrompt } from 'src/openai/prompts/work-summary';
import { criticismSummary } from '../openai/prompts/criticism-summary';
import { magazineSummaryPrompt } from 'src/openai/prompts/magazine-summary';
import { anthologySummaryPrompt } from 'src/openai/prompts/anthology-summary';
import { groupingSummaryPrompt } from 'src/openai/prompts/grouping-summary';

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
    private readonly openaiService: OpenaiService,
  ) {}

  async getCardById(id: string, fields: string): Promise<any> {
    try {
      const card = await this.cardModel
        .findOne({ _id: id })
        .select(fields)
        .exec();
      return card;
    } catch (error) {
      console.error('Error getting card:', error);
      throw new Error('Failed to get card. Please try again later.');
    }
  }

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

  async saveAuthorCardContent(
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

  async saveMagazineCardContent(
    id: string,
    updateCardDto: UpdateMagazineCardDto,
  ): Promise<Card> {
    try {
      console.log('updateCardDto', updateCardDto);
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

  async saveAnthologyCardContent(
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

  async saveGroupingCardContent(
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

  async updateAuthorCardAndSetPendingReview(
    id: string,
    updateCardDto: UpdateAuthorCardDto,
  ): Promise<Card> {
    try {
      //Generate Author Text
      const authorText = await this.openaiService.generateText(
        userSummaryPrompt,
        JSON.stringify({
          fullName: updateCardDto.fullName,
          gender: updateCardDto.gender,
          pseudonym: updateCardDto.pseudonym,
          dateOfBirth: updateCardDto.dateOfBirth,
          dateOfDeath: updateCardDto.dateOfDeath,
          placeOfBirth: updateCardDto.placeOfBirth,
          placeOfDeath: updateCardDto.placeOfDeath,
          relatives: updateCardDto.relatives,
          relevantActivities: updateCardDto.relevantActivities,
          mainTheme: updateCardDto.mainTheme,
          mainGenre: updateCardDto.mainGenre,
          context: updateCardDto.context,
        }),
      );

      // Generate Works Text
      const worksSummaries = await Promise.all(
        updateCardDto.works.map(async (work) => {
          const worksText = await this.openaiService.generateText(
            workSummaryPrompt,
            JSON.stringify({
              title: work.title,
              originalLanguage: work.originalLanguage,
              genre: work.genre,
              publicationDate: work.publicationDate,
              publicationPlace: {
                city: work.publicationPlace?.city,
                printingHouse: work.publicationPlace?.printingHouse,
                publisher: work.publicationPlace?.publisher,
              },
              description: work.description,
            }),
          );
          return worksText;
        }),
      );

      // Generate Criticism Text
      const criticismsSummaries = await Promise.all(
        updateCardDto.criticism.map(async (criticism) => {
          const criticismText = await this.openaiService.generateText(
            criticismSummary,
            JSON.stringify({
              title: criticism.title,
              type: criticism.type,
              author: criticism.author,
              publicationDate: criticism.publicationDate,
              link: criticism.link,
              bibliographicReference: criticism.bibliographicReference,
              description: criticism.description,
              text: criticism.text,
            }),
          );
          return criticismText;
        }),
      );

      updateCardDto.text = authorText;

      updateCardDto.works.forEach((work, index) => {
        work.text = worksSummaries[index];
      });

      updateCardDto.criticism.forEach((criticism, index) => {
        criticism.text = criticismsSummaries[index];
      });

      const updatedCard = await this.authorCardModel.findByIdAndUpdate(
        id,
        { ...updateCardDto, status: CardStatus.PENDING_REVIEW },
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
      console.error(
        'Error updating card and setting status to pending review:',
        error,
      );
      throw new Error(
        'Failed to update card and set status. Please try again later.',
      );
    }
  }

  async updateMagazineCardAndSetPendingReview(
    id: string,
    updateCardDto: UpdateMagazineCardDto,
  ): Promise<Card> {
    try {
      const magazineDescription = await this.openaiService.generateText(
        magazineSummaryPrompt,
        JSON.stringify({
          magazineTitle: updateCardDto.magazineTitle,
          originalLanguage: updateCardDto.originalLanguage,
          numbers: updateCardDto.numbers.map((issue) => ({
            number: issue.number,
            issueDate: issue.issueDate,
            publicationPlace: {
              city: issue.publicationPlace?.city,
              printingHouse: issue.publicationPlace?.printingHouse,
              publisher: issue.publicationPlace?.publisher,
            },
            language: issue.language,
            translator: issue.translator,
          })),
          creators: updateCardDto.creators.map((creator) => ({
            role: creator.role,
            name: creator.name,
          })),
          sections: updateCardDto.sections,
          description: updateCardDto.description,
        }),
      );

      const criticismsSummaries = await Promise.all(
        updateCardDto.criticism.map(async (criticism) => {
          const criticismText = await this.openaiService.generateText(
            criticismSummary,
            JSON.stringify({
              title: criticism.title,
              type: criticism.type,
              author: criticism.author,
              publicationDate: criticism.publicationDate,
              link: criticism.link,
              bibliographicReference: criticism.bibliographicReference,
              description: criticism.description,
              text: criticism.text,
            }),
          );
          return criticismText;
        }),
      );

      updateCardDto.criticism.forEach((criticism, index) => {
        criticism.text = criticismsSummaries[index];
      });

      updateCardDto.text = magazineDescription;

      const updatedCard = await this.magazineCardModel.findByIdAndUpdate(
        id,
        { ...updateCardDto, status: CardStatus.PENDING_REVIEW },
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
      console.error(
        'Error updating card and setting status to pending review:',
        error,
      );
      throw new Error(
        'Failed to update card and set status. Please try again later.',
      );
    }
  }

  async updateAnthologyCardAndSetPendingReview(
    id: string,
    updateCardDto: UpdateAnthologyCardDto,
  ): Promise<Card> {
    try {
      const anthologyDescription = await this.openaiService.generateText(
        anthologySummaryPrompt,
        JSON.stringify({
          anthologyTitle: updateCardDto.anthologyTitle,
          genre: updateCardDto.genre,
          author: updateCardDto.author,
          originalLanguage: updateCardDto.originalLanguage,
          publicationDate: updateCardDto.publicationDate,
          publicationPlace: {
            city: updateCardDto.publicationPlace?.city,
            printingHouse: updateCardDto.publicationPlace?.printingHouse,
            publisher: updateCardDto.publicationPlace?.publisher,
          },
          description: updateCardDto.description,
        }),
      );

      const criticismsSummaries = await Promise.all(
        updateCardDto.criticism.map(async (criticism) => {
          const criticismText = await this.openaiService.generateText(
            criticismSummary,
            JSON.stringify({
              title: criticism.title,
              type: criticism.type,
              author: criticism.author,
              publicationDate: criticism.publicationDate,
              link: criticism.link,
              bibliographicReference: criticism.bibliographicReference,
              description: criticism.description,
              text: criticism.text,
            }),
          );
          return criticismText;
        }),
      );

      updateCardDto.criticism.forEach((criticism, index) => {
        criticism.text = criticismsSummaries[index];
      });

      updateCardDto.text = anthologyDescription;

      const updatedCard = await this.anthologyCardModel.findByIdAndUpdate(
        id,
        { ...updateCardDto, status: CardStatus.PENDING_REVIEW },
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
      console.error(
        'Error updating card and setting status to pending review:',
        error,
      );
      throw new Error(
        'Failed to update card and set status. Please try again later.',
      );
    }
  }

  async updateGroupingCardAndSetPendingReview(
    id: string,
    updateCardDto: UpdateGroupingCardDto,
  ): Promise<Card> {
    try {
      const groupDescription = await this.openaiService.generateText(
        groupingSummaryPrompt,
        JSON.stringify({
          name: updateCardDto.name,
          meetingPlace: {
            city: updateCardDto.meetingPlace?.city,
            municipality: updateCardDto.meetingPlace?.municipality,
          },
          startDate: updateCardDto.startDate,
          endDate: updateCardDto.endDate,
          generalCharacteristics: updateCardDto.generalCharacteristics,
          members: updateCardDto.members,
          groupPublications: updateCardDto.groupPublications.map(
            (publication) => ({
              title: publication.title,
              year: publication.year,
              authors: publication.authors,
              summary: publication.summary,
            }),
          ),
          groupActivities: updateCardDto.groupActivities,
        }),
      );

      const criticismsSummaries = await Promise.all(
        updateCardDto.criticism.map(async (criticism) => {
          const criticismText = await this.openaiService.generateText(
            criticismSummary,
            JSON.stringify({
              title: criticism.title,
              type: criticism.type,
              author: criticism.author,
              publicationDate: criticism.publicationDate,
              link: criticism.link,
              bibliographicReference: criticism.bibliographicReference,
              description: criticism.description,
              text: criticism.text,
            }),
          );
          return criticismText;
        }),
      );

      updateCardDto.criticism.forEach((criticism, index) => {
        criticism.text = criticismsSummaries[index];
      });

      updateCardDto.text = groupDescription;

      const updatedCard = await this.groupingCardModel.findByIdAndUpdate(
        id,
        { ...updateCardDto, status: CardStatus.PENDING_REVIEW },
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
      console.error(
        'Error updating card and setting status to pending review:',
        error,
      );
      throw new Error(
        'Failed to update card and set status. Please try again later.',
      );
    }
  }

  async uploadAuthorCard(id: string): Promise<AuthorCard> {
    const session = await this.authorCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.authorCardModel
        .findByIdAndUpdate(
          id,
          { status: CardStatus.VALIDATED },
          {
            new: true,
            runValidators: true,
            session,
          },
        )
        .lean()
        .exec();

      if (!updatedCard) {
        throw new Error('Card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createAuthorCardNodes({
        fullName: updatedCard.fullName,
        pseudonym: updatedCard.pseudonym,
        dateOfBirth: updatedCard.dateOfBirth,
        dateOfDeath: updatedCard.dateOfDeath,
        placeOfBirth: updatedCard.placeOfBirth,
        placeOfDeath: updatedCard.placeOfDeath,
        relatives: updatedCard.relatives,
        relevantActivities: updatedCard.relevantActivities,
        mainTheme: updatedCard.mainTheme,
        mainGenre: updatedCard.mainGenre,
        context: updatedCard.context,
        multimedia: updatedCard.multimedia,
        works: updatedCard.works,
        criticism: updatedCard.criticism,
        gender: updatedCard.gender,
        text: updatedCard.text,
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

  async uploadMagazineCard(id: string): Promise<MagazineCard> {
    const session = await this.magazineCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.magazineCardModel
        .findByIdAndUpdate(
          id,
          { status: CardStatus.VALIDATED },
          {
            new: true,
            runValidators: true,
            session,
          },
        )
        .lean()
        .exec();

      if (!updatedCard) {
        throw new Error('Magazine card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createMagazineCardNodes({
        magazineTitle: updatedCard.magazineTitle,
        originalLanguage: updatedCard.originalLanguage,
        sections: updatedCard.sections,
        description: updatedCard.description,
        text: updatedCard.text,
        numbers: updatedCard.numbers,
        multimedia: updatedCard.multimedia,
        creators: updatedCard.creators,
        criticism: updatedCard.criticism,
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

  async uploadAnthologyCard(id: string): Promise<AnthologyCard> {
    const session = await this.anthologyCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.anthologyCardModel
        .findByIdAndUpdate(
          id,
          { status: CardStatus.VALIDATED },
          {
            new: true,
            runValidators: true,
            session,
          },
        )
        .lean()
        .exec();

      if (!updatedCard) {
        throw new Error('Anthology card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createAnthologyCardNodes({
        anthologyTitle: updatedCard.anthologyTitle,
        genre: updatedCard.genre,
        author: updatedCard.author,
        originalLanguage: updatedCard.originalLanguage,
        publicationDate: updatedCard.publicationDate,
        publicationPlace: updatedCard.publicationPlace,
        description: updatedCard.description,
        text: updatedCard.text,
        multimedia: updatedCard.multimedia,
        criticism: updatedCard.criticism,
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

  async uploadGroupingCard(id: string): Promise<GroupingCard> {
    const session = await this.groupingCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.groupingCardModel
        .findByIdAndUpdate(
          id,
          { status: CardStatus.VALIDATED },
          {
            new: true,
            runValidators: true,
            session,
          },
        )
        .lean()
        .exec();

      if (!updatedCard) {
        throw new Error('Grouping card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createGroupingCardNodes({
        name: updatedCard.name,
        meetingPlace: updatedCard.meetingPlace,
        startDate: updatedCard.startDate,
        endDate: updatedCard.endDate,
        generalCharacteristics: updatedCard.generalCharacteristics,
        members: updatedCard.members,
        groupPublications: updatedCard.groupPublications,
        groupActivities: updatedCard.groupActivities,
        multimedia: updatedCard.multimedia,
        criticism: updatedCard.criticism,
        text: updatedCard.text,
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

  async findAllRejectedCards(): Promise<Card[]> {
    try {
      return await this.cardModel
        .find({ status: CardStatus.REJECTED })
        .populate('assignedEditors', '_id fullName email imageUrl')
        .populate('assignedReviewers', '_id fullName email imageUrl')
        .exec();
    } catch (error) {
      console.error('Error retrieving rejected cards:', error);
      throw new Error('Failed to retrieve rejected cards.');
    }
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

  async rejectCard(id: string, observation: string): Promise<Card> {
    try {
      const updatedCard = await this.cardModel.findByIdAndUpdate(
        id,
        { status: CardStatus.REJECTED, observation },
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
      console.error('Error rejecting card:', error);
      throw new Error('Failed to reject card. Please try again later.');
    }
  }

  async markCardAsPendingEdit(id: string): Promise<Card> {
    try {
      const updatedCard = await this.cardModel.findByIdAndUpdate(
        id,
        { status: CardStatus.PENDING_EDIT },
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
      console.error('Error marking card as pending edit:', error);
      throw new Error('Failed to update card. Please try again later.');
    }
  }

  async getCardTextsById(id: string): Promise<any> {
    try {
      const card = await this.cardModel.findById(id).exec();

      if (!card) {
        throw new Error('Card not found');
      }

      if (card.type === 'AuthorCard') {
        const authorCard = await this.authorCardModel
          .findById(id)
          .select('fullName text works criticism')
          .populate('works', 'title text')
          .populate('criticism', 'title text')
          .exec();

        if (!authorCard) {
          throw new Error('Author card not found');
        }

        return {
          author: {
            title: authorCard.fullName,
            text: authorCard.text,
          },
          works: authorCard.works.map((work) => ({
            title: work.title,
            text: work.text,
          })),
          criticism: authorCard.criticism.map((criticism) => ({
            title: criticism.title,
            text: criticism.text,
          })),
        };
      }

      switch (card.type) {
        case 'MagazineCard':
          const magazineCard = await this.magazineCardModel
            .findById(id)
            .select('magazineTitle text criticism')
            .populate('criticism', 'title text')
            .exec();
          return {
            magazine: {
              title: magazineCard.magazineTitle,
              text: magazineCard.text,
            },
            criticism: magazineCard.criticism.map((criticism) => ({
              title: criticism.title,
              text: criticism.text,
            })),
          };
        case 'GroupingCard':
          const groupingCard = await this.groupingCardModel
            .findById(id)
            .select('magazineTitle text criticism')
            .populate('criticism', 'title text')
            .exec();
          return {
            magazine: {
              title: magazineCard.magazineTitle,
              text: magazineCard.text,
            },
            criticism: magazineCard.criticism.map((criticism) => ({
              title: criticism.title,
              text: criticism.text,
            })),
          };
        case 'AnthologyCard':
          return this.anthologyCardModel.findById(id).select('text').exec();
        default:
          throw new Error('Invalid card type');
      }
    } catch (error) {
      console.error('Error fetching card texts:', error);
      throw new Error('Failed to fetch card texts. Please try again later.');
    }
  }

  async saveCardTexts(
    id: string,
    text: string,
    works: string[],
    criticism: string[],
  ): Promise<Card> {
    const session = await this.authorCardModel.db.startSession();
    session.startTransaction();

    try {
      const card = await this.cardModel.findById(id).exec();

      if (!card) {
        throw new Error('Card not found');
      }

      let updatedCard;
      if (card.type === 'AuthorCard') {
        const updateData: any = { text };

        if (works && works.length > 0) {
          updateData['works'] = works.map((workText) => ({
            text: workText,
          }));
        }

        if (criticism && criticism.length > 0) {
          updateData['criticism'] = criticism.map((critText) => ({
            text: critText,
          }));
        }

        updatedCard = await this.authorCardModel.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true,
            runValidators: true,
            session,
          },
        );

        if (!updatedCard) {
          throw new Error('Failed to save author card texts');
        }
      } else {
        switch (card.type) {
          case 'MagazineCard':
            updatedCard = await this.magazineCardModel.findByIdAndUpdate(
              id,
              { text },
              { new: true, runValidators: true, session },
            );
            break;
          case 'GroupingCard':
            updatedCard = await this.groupingCardModel.findByIdAndUpdate(
              id,
              { text },
              { new: true, runValidators: true, session },
            );
            break;
          case 'AnthologyCard':
            updatedCard = await this.anthologyCardModel.findByIdAndUpdate(
              id,
              { text },
              { new: true, runValidators: true, session },
            );
            break;
          default:
            throw new Error('Invalid card type');
        }

        if (!updatedCard) {
          throw new Error('Failed to save card text');
        }
      }

      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error saving card texts:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
}
