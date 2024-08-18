import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
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
    const { password, email } = loginUserDto;

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
    const { userId, roles } = assignRolesDto;

    if (roles.includes(UserRoles.ADMINISTRATOR)) {
      throw new BadRequestException('Cannot assign administrator role');
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
