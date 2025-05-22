import { BadRequestException, Injectable } from '@nestjs/common';
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
import { OpenaiService } from '../openai/openai.service';
import { userSummaryPrompt } from '../openai/prompts/user-summary';
import { workSummaryPrompt } from '../openai/prompts/work-summary';
import { criticismSummary } from '../openai/prompts/criticism-summary';
import { magazineSummaryPrompt } from '../openai/prompts/magazine-summary';
import { anthologySummaryPrompt } from '../openai/prompts/anthology-summary';
import { groupingSummaryPrompt } from '../openai/prompts/grouping-summary';
import { Gender } from './interfaces/gender.interface';
import { MythAndLegendCard } from './entities/mythLegend.entity';
import { UpdateMythAndLegendCardDto } from './dto/update-mythLegend-card.dto';
import { mythAndLegendSummaryPrompt } from '../openai/prompts/myth-legend-summary';
import { MlType } from './interfaces/mlType.interface';

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

    @InjectModel(MythAndLegendCard.name)
    private readonly mythAndLegendCardModel: Model<MythAndLegendCard>,

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
        case 'AuthorCard':
          createdCard = new this.authorCardModel(data);
          break;
        case 'AnthologyCard':
          createdCard = new this.anthologyCardModel(data);
          break;
        case 'MagazineCard':
          createdCard = new this.magazineCardModel(data);
          break;
        case 'GroupingCard':
          createdCard = new this.groupingCardModel(data);
          break;
        case 'MythLegendCard':
          createdCard = new this.mythAndLegendCardModel(data);
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
      console.log('updateCardDto', updateCardDto);
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

  async deleteCard(cardId: string) {
    const card = await this.cardModel.findByIdAndDelete(cardId).exec();
    if (!card) {
      throw new BadRequestException('Ficha no encontrada.');
    }
    await this.queryRepository.deleteCardNodes(cardId);
    return { message: 'Ficha eliminada correctamente.' };
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

  // Nuevo Mito Leyenda
  async saveMythAndLegendCardContent(
    id: string,
    updateCardDto: UpdateMythAndLegendCardDto,
  ): Promise<Card> {
    try {
      const updatedCard = await this.mythAndLegendCardModel.findByIdAndUpdate(
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
      console.error('Error updating MythAndLegendCard:', error);
      throw new Error(
        'Failed to update MythAndLegendCard. Please try again later.',
      );
    }
  }

  async updateAuthorCardAndSetPendingReview(
    id: string,
    updateCardDto: UpdateAuthorCardDto,
  ): Promise<Card> {
    try {
      // Generate Author Text
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
              author: updateCardDto.fullName,
              title: work.title,
              originalLanguage: work.originalLanguage,
              genre: work.genre,
              publicationDate: work.publicationDate,
              publicationPlace: {
                city: work.publicationPlace?.city,
                printingHouse: work.publicationPlace?.printingHouse,
                publisher: work.publicationPlace?.publisher,
              },
              editions: work.editions.map((edition) => ({
                publicationDate: edition.publicationDate,
                editiontitle: edition.editiontitle,
                language: edition.language,
                translator: edition.translator,
                publicationPlace: {
                  city: edition.publicationPlace?.city,
                  printingHouse: edition.publicationPlace?.printingHouse,
                  publisher: edition.publicationPlace?.publisher,
                },
              })),
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
        {
          ...updateCardDto,
          status: CardStatus.PENDING_REVIEW,
        },
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
          firstIssueDate: updateCardDto.firstIssueDate,
          lastIssueDate: updateCardDto.lastIssueDate,
          issuesPublished: updateCardDto.issuesPublished,
          publicationPlace: {
            city: updateCardDto.publicationPlace?.city,
            printingHouse: updateCardDto.publicationPlace?.printingHouse,
            publisher: updateCardDto.publicationPlace?.publisher,
          },
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
        {
          ...updateCardDto,
          status: CardStatus.PENDING_REVIEW,
        },
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
        {
          ...updateCardDto,
          status: CardStatus.PENDING_REVIEW,
        },
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
        {
          ...updateCardDto,
          status: CardStatus.PENDING_REVIEW,
        },
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

  // Nuevo Mitos y Leyendas
  async updateMythAndLegendCardAndSetPendingReview(
    id: string,
    updateCardDto: UpdateMythAndLegendCardDto,
  ): Promise<Card> {
    try {
      // Generar la descripción de Mitos y Leyendas
      const mythLegendDescription = await this.openaiService.generateText(
        mythAndLegendSummaryPrompt,
        JSON.stringify({
          mlTitle: updateCardDto.mlTitle,
          mlType: updateCardDto.mlType,
          creatorCommunity: updateCardDto.creatorCommunity,
          diffusionPlace: updateCardDto.diffusionPlace,
          originalLanguage: updateCardDto.originalLanguage,
          fullText: updateCardDto.fullText,
          mainTheme: updateCardDto.mainTheme,
          description: updateCardDto.description,
        }),
      );

      // Generar los textos de críticas
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

      // Asignar los textos generados a las críticas
      updateCardDto.criticism.forEach((criticism, index) => {
        criticism.text = criticismsSummaries[index];
      });

      // Asignar la descripción generada al texto principal
      updateCardDto.text = mythLegendDescription;

      // Actualizar la tarjeta en la base de datos y establecer el estado como PENDING_REVIEW
      const updatedCard = await this.mythAndLegendCardModel.findByIdAndUpdate(
        id,
        {
          ...updateCardDto,
          status: CardStatus.PENDING_REVIEW,
        },
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
        'Error updating MythAndLegend card and setting status to pending review:',
        error,
      );
      throw new Error(
        'Failed to update MythAndLegend card and set status. Please try again later.',
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
          { status: CardStatus.VALIDATED, observation: '' },
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
        fullName:
          updatedCard.fullName && updatedCard.fullName !== ''
            ? updatedCard.fullName
            : null,
        pseudonym:
          updatedCard.pseudonym && updatedCard.pseudonym !== ''
            ? updatedCard.pseudonym
            : null,
        dateOfBirth:
          updatedCard.dateOfBirth && updatedCard.dateOfBirth !== ''
            ? updatedCard.dateOfBirth
            : null,
        dateOfDeath:
          updatedCard.dateOfDeath && updatedCard.dateOfDeath !== ''
            ? updatedCard.dateOfDeath
            : null,
        placeOfBirth:
          updatedCard.placeOfBirth && updatedCard.placeOfBirth !== ''
            ? updatedCard.placeOfBirth
            : null,
        placeOfDeath:
          updatedCard.placeOfDeath && updatedCard.placeOfDeath !== ''
            ? updatedCard.placeOfDeath
            : null,
        relatives: updatedCard.relatives ? updatedCard.relatives : [],
        relevantActivities:
          updatedCard.relevantActivities &&
          updatedCard.relevantActivities !== ''
            ? updatedCard.relevantActivities
            : null,
        mainTheme:
          updatedCard.mainTheme && updatedCard.mainTheme !== ''
            ? updatedCard.mainTheme
            : null,
        mainGenre:
          updatedCard.mainGenre && updatedCard.mainGenre !== ''
            ? updatedCard.mainGenre
            : null,
        context:
          updatedCard.context && updatedCard.context !== ''
            ? updatedCard.context
            : null,
        multimedia: updatedCard.multimedia ? updatedCard.multimedia : [],
        works: updatedCard.works ? updatedCard.works : [],
        criticism: updatedCard.criticism ? updatedCard.criticism : [],
        gender:
          updatedCard.gender &&
          Object.values(Gender).includes(updatedCard.gender)
            ? updatedCard.gender
            : null,
        text:
          updatedCard.text && updatedCard.text !== '' ? updatedCard.text : null,
        id,
        openAiApiKey: process.env.OPENAI_API_KEY,
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
          { status: CardStatus.VALIDATED, observation: '' },
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
        magazineTitle:
          updatedCard.magazineTitle && updatedCard.magazineTitle !== ''
            ? updatedCard.magazineTitle
            : null,
        originalLanguage:
          updatedCard.originalLanguage && updatedCard.originalLanguage !== ''
            ? updatedCard.originalLanguage
            : null,
        firstIssueDate:
          updatedCard.firstIssueDate && updatedCard.firstIssueDate !== ''
            ? updatedCard.firstIssueDate
            : null,
        lastIssueDate:
          updatedCard.lastIssueDate && updatedCard.lastIssueDate !== ''
            ? updatedCard.lastIssueDate
            : null,
        issuesPublished:
          updatedCard.issuesPublished && updatedCard.issuesPublished !== ''
            ? updatedCard.issuesPublished
            : null,
        sections:
          updatedCard.sections && updatedCard.sections !== ''
            ? updatedCard.sections
            : null,
        description:
          updatedCard.description && updatedCard.description !== ''
            ? updatedCard.description
            : null,
        link:
          updatedCard.link && updatedCard.link !== '' ? updatedCard.link : null,
        bibliographicReference:
          updatedCard.bibliographicReference &&
          updatedCard.bibliographicReference !== ''
            ? updatedCard.bibliographicReference
            : null,
        text:
          updatedCard.text && updatedCard.text !== '' ? updatedCard.text : null,
        multimedia: updatedCard.multimedia ? updatedCard.multimedia : [],
        creators: updatedCard.creators ? updatedCard.creators : [],
        criticism: updatedCard.criticism ? updatedCard.criticism : [],
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
          { status: CardStatus.VALIDATED, observation: '' },
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
        anthologyTitle:
          updatedCard.anthologyTitle && updatedCard.anthologyTitle !== ''
            ? updatedCard.anthologyTitle
            : null,
        genre:
          updatedCard.genre && updatedCard.genre !== ''
            ? updatedCard.genre
            : null,
        author:
          updatedCard.author && updatedCard.author !== ''
            ? updatedCard.author
            : null,
        originalLanguage:
          updatedCard.originalLanguage && updatedCard.originalLanguage !== ''
            ? updatedCard.originalLanguage
            : null,
        publicationDate:
          updatedCard.publicationDate && updatedCard.publicationDate !== ''
            ? updatedCard.publicationDate
            : null,
        publicationPlace: updatedCard.publicationPlace
          ? updatedCard.publicationPlace
          : null,
        description:
          updatedCard.description && updatedCard.description !== ''
            ? updatedCard.description
            : null,
        text:
          updatedCard.text && updatedCard.text !== '' ? updatedCard.text : null,
        multimedia: updatedCard.multimedia ? updatedCard.multimedia : [],
        criticism: updatedCard.criticism ? updatedCard.criticism : [],
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
          { status: CardStatus.VALIDATED, observation: '' },
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
        name:
          updatedCard.name && updatedCard.name !== '' ? updatedCard.name : null,
        meetingPlace: updatedCard.meetingPlace
          ? updatedCard.meetingPlace
          : null,
        startDate:
          updatedCard.startDate && updatedCard.startDate !== ''
            ? updatedCard.startDate
            : null,
        endDate:
          updatedCard.endDate && updatedCard.endDate !== ''
            ? updatedCard.endDate
            : null,
        generalCharacteristics:
          updatedCard.generalCharacteristics &&
          updatedCard.generalCharacteristics !== ''
            ? updatedCard.generalCharacteristics
            : null,
        members: updatedCard.members ? updatedCard.members : [],
        groupPublications: updatedCard.groupPublications
          ? updatedCard.groupPublications
          : [],
        groupActivities:
          updatedCard.groupActivities && updatedCard.groupActivities !== ''
            ? updatedCard.groupActivities
            : null,
        multimedia: updatedCard.multimedia ? updatedCard.multimedia : [],
        criticism: updatedCard.criticism ? updatedCard.criticism : [],
        text:
          updatedCard.text && updatedCard.text !== '' ? updatedCard.text : null,
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

  // Nuevo Mito Leyenda
  async uploadMythLegendCard(id: string): Promise<MythAndLegendCard> {
    const session = await this.mythAndLegendCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.mythAndLegendCardModel
        .findByIdAndUpdate(
          id,
          { status: CardStatus.VALIDATED, observation: '' },
          {
            new: true,
            runValidators: true,
            session,
          },
        )
        .lean()
        .exec();

      if (!updatedCard) {
        throw new Error('Myth and Legend card not found');
      }

      await this.queryRepository.deleteCardNodes(id);

      await this.queryRepository.createMythLegendCardNodes({
        mlTitle:
          updatedCard.mlTitle && updatedCard.mlTitle !== ''
            ? updatedCard.mlTitle
            : null,
        mlType:
          updatedCard.mlType &&
          Object.values(MlType).includes(updatedCard.mlType)
            ? updatedCard.mlType
            : null,
        creatorCommunity:
          updatedCard.creatorCommunity && updatedCard.creatorCommunity !== ''
            ? updatedCard.creatorCommunity
            : null,
        diffusionPlace:
          updatedCard.diffusionPlace && updatedCard.diffusionPlace !== ''
            ? updatedCard.diffusionPlace
            : null,
        originalLanguage:
          updatedCard.originalLanguage && updatedCard.originalLanguage !== ''
            ? updatedCard.originalLanguage
            : null,
        fullText:
          updatedCard.fullText && updatedCard.fullText !== ''
            ? updatedCard.fullText
            : null,
        mainTheme:
          updatedCard.mainTheme && updatedCard.mainTheme !== ''
            ? updatedCard.mainTheme
            : null,
        description:
          updatedCard.description && updatedCard.description !== ''
            ? updatedCard.description
            : null,
        multimedia: updatedCard.multimedia ? updatedCard.multimedia : [],
        criticism: updatedCard.criticism ? updatedCard.criticism : [],
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

  async markCardAsPendingEdit(id: string, observation: string): Promise<Card> {
    try {
      const updatedCard = await this.cardModel.findByIdAndUpdate(
        id,
        { status: CardStatus.PENDING_EDIT, observation },
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
          .select('fullName text works criticism observation')
          .populate('works')
          .populate('criticism')
          .exec();

        if (!authorCard) {
          throw new Error('Author card not found');
        }

        return {
          author: {
            title: authorCard.fullName,
            text: authorCard.text,
          },
          works: authorCard.works,
          criticism: authorCard.criticism,
          observation: authorCard.observation,
        };
      }

      switch (card.type) {
        case 'MagazineCard':
          const magazineCard = await this.magazineCardModel
            .findById(id)
            .select('magazineTitle text criticism observation')
            .populate('criticism')
            .exec();
          return {
            magazine: {
              title: magazineCard.magazineTitle,
              text: magazineCard.text,
            },
            criticism: magazineCard.criticism,
            observation: magazineCard.observation,
          };
        case 'GroupingCard':
          const groupingCard = await this.groupingCardModel
            .findById(id)
            .select('name text criticism observation')
            .populate('criticism')
            .exec();
          return {
            grouping: {
              title: groupingCard.name,
              text: groupingCard.text,
            },
            criticism: groupingCard.criticism,
            observation: groupingCard.observation,
          };
        case 'AnthologyCard':
          const anthologyCard = await this.anthologyCardModel
            .findById(id)
            .select('title text criticism observation')
            .populate('criticism')
            .exec();
          return {
            anthology: {
              title: anthologyCard.title,
              text: anthologyCard.text,
            },
            criticism: anthologyCard.criticism,
            observation: anthologyCard.observation,
          };
        case 'MythLegendCard': // Nuevo caso para MythLegendCard
          const mythLegendCard = await this.mythAndLegendCardModel
            .findById(id)
            .select('mlTitle mlType fullText criticism observation')
            .populate('criticism')
            .exec();
          return {
            mythLegend: {
              title: mythLegendCard.mlTitle,
              text: mythLegendCard.fullText,
            },
            criticism: mythLegendCard.criticism,
            observation: mythLegendCard.observation,
          };
        default:
          throw new Error('Invalid card type');
      }
    } catch (error) {
      console.error('Error fetching card texts:', error);
      throw new Error('Failed to fetch card texts. Please try again later.');
    }
  }

  async saveAuthorCardTexts(
    id: string,
    text: string,
    works: string[],
    criticism: string[],
  ): Promise<Card> {
    const session = await this.authorCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.authorCardModel.findByIdAndUpdate(
        id,
        { text, works, criticism },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
      }
      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      // En caso de error, hacer rollback de la transacción
      await session.abortTransaction();
      session.endSession();
      console.error('Error saving card texts:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  async saveAnthologyCardTexts(
    id: string,
    text: string,
    criticism: string[],
  ): Promise<Card> {
    const session = await this.authorCardModel.db.startSession();
    session.startTransaction();

    try {
      const updatedCard = await this.anthologyCardModel.findByIdAndUpdate(
        id,
        { text, criticism },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!updatedCard) {
        throw new Error('Card not found');
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
