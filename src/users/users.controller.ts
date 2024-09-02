import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoles } from './interfaces/user-roles.interface';
import { Auth } from './decorators/auth.decorators';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('auth/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @Get('auth/check-token')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.usersService.checkAuthStatus(user);
  }

  @Get('auth/private3')
  @Auth(UserRoles.ADMINISTRATOR, UserRoles.RESEARCHER)
  testingPrivateRoute3(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
  ) {
    return {
      ok: true,
      message: 'Testing Private',
      user,
      userEmail,
    };
  }

  @Put('assign-roles')
  async assignRoles(@Body() assignRolesDto: AssignRolesDto) {
    return this.usersService.assignRoles(assignRolesDto);
  }

  @Get('by-role')
  async findUsersByRole() {
    return this.usersService.findUsersByRole();
  }

  @Post('')
  async findUsers(@Body() excludedUserId: { excludedUser: string }) {
    return this.usersService.findUsers(excludedUserId);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get('find-by-role')
  async findUsersByRoleExcludingIds(
    @Query('type') type: 'editor' | 'reviewer',
    @Query('excludeIds') excludeIds: string,
  ) {
    const excludeIdsArray = excludeIds
      ? excludeIds.split(',').map((id) => id.trim())
      : [];

    return this.usersService.findUsersByRoleExcludingIds(type, excludeIdsArray);
  }
}
