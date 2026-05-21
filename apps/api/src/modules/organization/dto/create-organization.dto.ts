import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrgType } from '@prisma/client';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(SLUG_REGEX, {
    message: 'Le slug ne peut contenir que des minuscules, chiffres et tirets',
  })
  slug!: string;

  @IsEnum(OrgType)
  @IsOptional()
  type?: OrgType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
