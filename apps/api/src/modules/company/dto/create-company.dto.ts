import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nif?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cnssNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cnamgsNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, {
    message:
      "country doit être un code ISO 3166-1 alpha-2 en majuscules (ex: GA)",
  })
  country?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: "currency doit être un code ISO 4217 en majuscules (ex: XAF)",
  })
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
