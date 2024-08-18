import { IsMongoId, IsArray, ArrayNotEmpty, IsEnum } from 'class-validator';
import { UserRoles } from '../interfaces/user-roles.interface';

export class AssignRolesDto {
  @IsMongoId()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[];
}
