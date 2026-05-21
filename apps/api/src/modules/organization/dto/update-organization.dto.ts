import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Matches(SLUG_REGEX, {
    message: 'Le slug ne peut contenir que des minuscules, chiffres et tirets',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
