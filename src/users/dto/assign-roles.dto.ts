import { IsMongoId, IsArray, IsEnum } from 'class-validator';
import { UserRoles } from '../interfaces/user-roles.interface';

export class AssignRolesDto {
  @IsMongoId()
  userId: string;

  @IsArray()
  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[];
}
