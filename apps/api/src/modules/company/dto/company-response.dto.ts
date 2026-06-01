export class CompanyResponseDto {
  id!: string;
  orgId!: string;
  name!: string;
  nif!: string | null;
  cnssNumber!: string | null;
  cnamgsNumber!: string | null;
  country!: string;
  currency!: string;
  description!: string | null;
  createdAt!: Date;
}
