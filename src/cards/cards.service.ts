import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { UserRoles } from 'src/users/interfaces/user-roles.interface';
import { CardStatus } from './interfaces/card-status.interface';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name)
    private readonly CardsModel: Model<Card>,
    @InjectModel(User.name)
    private readonly UsersModel: Model<User>,
  ) {}

  async create(createCardDto: CreateCardDto) {
    const session = await this.CardsModel.db.startSession();
    session.startTransaction();

    try {
      const { assignedEditor, assignedReviewer, ...data } = createCardDto;

      const [card, editor, reviewer] = await Promise.all([
        this.CardsModel.create([data], { session }),
        this.UsersModel.findById(assignedEditor, '_id assignedCardsAsEditor', {
          session,
        }).lean(),
        this.UsersModel.findById(
          assignedReviewer,
          '_id assignedCardsAsReviewer',
          {
            session,
          },
        ).lean(),
      ]);

      if (!editor || !reviewer) {
        throw new BadRequestException('Invalid editor or reviewer ID');
      }

      card[0].assignedEditor = editor;
      card[0].assignedReviewer = reviewer;

      editor.assignedCardsAsEditor.push(card[0]);
      reviewer.assignedCardsAsReviewer.push(card[0]);

      await Promise.all([
        card[0].save({ session }),
        this.UsersModel.updateOne(
          { _id: editor._id },
          { $push: { assignedCardsAsEditor: card[0]._id } },
          { session },
        ),
        this.UsersModel.updateOne(
          { _id: reviewer._id },
          { $push: { assignedCardsAsReviewer: card[0]._id } },
          { session },
        ),
      ]);

      await session.commitTransaction();
      session.endSession();

      return card[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.handleExceptions(error);
    }
  }

  async findAll(user: User) {
    // Inicializar arrays para las tarjetas como editor y revisor
    let editorCards = [];
    let reviewerCards = [];

    // Verificar si el usuario es administrador
    if (user.roles.includes(UserRoles.ADMINISTRATOR)) {
      // Si es administrador, devolver todas las tarjetas sin filtrado
      return await this.CardsModel.find().exec();
    }

    // Verificar si el usuario tiene el rol de editor y buscar las tarjetas correspondientes
    if (user.roles.includes(UserRoles.EDITOR)) {
      editorCards = await this.CardsModel.find({
        assignedEditor: user._id,
      }).exec();
    }

    // Verificar si el usuario tiene el rol de revisor y buscar las tarjetas correspondientes
    if (user.roles.includes(UserRoles.REVIEWER)) {
      reviewerCards = await this.CardsModel.find({
        assignedReviewer: user._id,
      }).exec();
    }

    // Devolver el resultado con las tarjetas encontradas
    return {
      editorCards,
      reviewerCards,
    };
  }

  async findOne(id: string, session: ClientSession) {
    const card = await this.CardsModel.findById(id).session(session);

    if (!card) {
      throw new BadRequestException(`Card with id:${id} not found`);
    }

    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    const session = await this.CardsModel.db.startSession();
    session.startTransaction();

    try {
      const card = await this.findOne(id, session);

      const { assignedEditor, assignedReviewer, ...data } = updateCardDto;
      let editor, reviewer;

      if (assignedEditor) {
        editor = await this.UsersModel.findById(
          assignedEditor,
          '_id assignedCardsAsEditor',
          { session },
        ).lean();

        if (!editor) {
          throw new BadRequestException('Invalid editor ID');
        }
      }

      if (assignedReviewer) {
        reviewer = await this.UsersModel.findById(
          assignedReviewer,
          '_id assignedCardsAsReviewer',
          { session },
        ).lean();

        if (!reviewer) {
          throw new BadRequestException('Invalid reviewer ID');
        }
      }

      const updates: Promise<any>[] = [
        this.CardsModel.findByIdAndUpdate(
          id,
          {
            ...data,
            assignedEditor: editor || card.assignedEditor,
            assignedReviewer: reviewer || card.assignedReviewer,
          },
          {
            session,
            new: true,
          },
        )
          .lean()
          .exec(),
      ];

      // Eliminar la tarjeta del editor y revisor anterior si son diferentes de los nuevos
      if (assignedEditor && card.assignedEditor.toString() !== assignedEditor) {
        updates.push(
          this.UsersModel.updateOne(
            { _id: card.assignedEditor },
            { $pull: { assignedCardsAsEditor: id } },
            { session },
          ).exec(),

          this.UsersModel.updateOne(
            { _id: assignedEditor },
            { $addToSet: { assignedCardsAsEditor: id } },
            { session },
          ).exec(),
        );
      }

      if (
        assignedReviewer &&
        card.assignedReviewer.toString() !== assignedReviewer
      ) {
        updates.push(
          this.UsersModel.updateOne(
            { _id: card.assignedReviewer },
            { $pull: { assignedCardsAsReviewer: id } },
            { session },
          ).exec(),

          this.UsersModel.updateOne(
            { _id: assignedReviewer },
            { $addToSet: { assignedCardsAsReviewer: id } },
            { session },
          ).exec(),
        );
      }

      const [updatedCard] = await Promise.all(updates);

      await session.commitTransaction();
      session.endSession();

      return updatedCard;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const session = await this.CardsModel.db.startSession();
    session.startTransaction();

    try {
      const card = await this.findOne(id, session);

      const { assignedEditor, assignedReviewer } = card;

      const updates: Promise<any>[] = [
        this.CardsModel.deleteOne({ _id: id }, { session }).exec(),
      ];

      if (assignedEditor) {
        updates.push(
          this.UsersModel.updateOne(
            { _id: assignedEditor },
            { $pull: { assignedCardsAsEditor: id } },
            { session },
          ).exec(),
        );
      }

      if (assignedReviewer) {
        updates.push(
          this.UsersModel.updateOne(
            { _id: assignedReviewer },
            { $pull: { assignedCardsAsReviewer: id } },
            { session },
          ).exec(),
        );
      }

      await Promise.all(updates);

      await session.commitTransaction();
      session.endSession();

      return { statusCode: 200, message: 'Card deleted successfully' };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.handleExceptions(error);
    }
  }

  async completeCard(id: string) {
    const session = await this.CardsModel.db.startSession();
    session.startTransaction();

    try {
      const card = await this.findOne(id, session);

      if (card.status === CardStatus.PENDING_REVIEW) {
        throw new BadRequestException('Card already marked as completed');
      }

      card.status = CardStatus.PENDING_REVIEW;

      await card.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { statusCode: 200, message: 'Card marked as completed' };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.handleExceptions(error);
    }
  }

  async approveCard(id: string) {
    return id;
  }

  async rejectCard(id: string) {
    return id;
  }

  private handleExceptions(error: any): never {
    if (error.code === 11000) {
      throw new BadRequestException('Card already exists');
    }

    console.log(error);
    throw new BadRequestException('Error creating card - Check server logs');
  }
}
