import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UserRoles } from './interfaces/user-roles.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly UsersModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findUsers(excludeUserId: { excludedUser: string }) {
    try {
      const objectId = new Types.ObjectId(excludeUserId.excludedUser);
      const users = await this.UsersModel.find({
        _id: { $ne: objectId },
      }).exec();
      return users.map((user) => {
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al obtener los usuarios.');
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = await this.UsersModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      const userObj = user.toObject();
      delete userObj.password;

      return {
        ...userObj,
        token: this.getJwtToken({ id: user._id.toString() }),
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password = '', email } = loginUserDto;

    const user = await this.UsersModel.findOne({
      email,
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales Invalidas.');
    }

    const userObj = user.toObject();
    delete userObj.password;

    return {
      ...userObj,
      token: this.getJwtToken({ id: user._id.toString() }),
    };
  }

  async assignRoles(assignRolesDto: AssignRolesDto) {
    const { userId } = assignRolesDto;
    let { roles } = assignRolesDto;

    roles = [UserRoles.RESEARCHER, ...roles];

    if (roles.includes(UserRoles.ADMINISTRATOR)) {
      roles = [UserRoles.ADMINISTRATOR];
    }

    const user = await this.UsersModel.findByIdAndUpdate(
      userId,
      { roles },
      { new: true },
    ).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  }

  async findUsersByRole(role: UserRoles) {
    if (!Object.values(UserRoles).includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const users = await this.UsersModel.find({ roles: role }).exec();

    return users.map((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
  }

  async checkAuthStatus(user: User) {
    const userObj = user.toObject();
    delete userObj.password;

    return {
      ...userObj,
      token: this.getJwtToken({ id: user._id.toString() }),
    };
  }

  async deleteUser(userId: string) {
    const user = await this.UsersModel.findByIdAndDelete(userId).exec();
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }
    return { message: 'Usuario eliminado correctamente.' };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      console.log(error);
      throw new BadRequestException('Ya existe un usuario con ese email.');
    }
    console.log(error);
    throw new BadRequestException('Error al crear el usuario.');
  }
}
