import { OrgType } from '@prisma/client';

export class OrganizationDto {
  id!: string;
  name!: string;
  slug!: string;
  type!: OrgType;
  description!: string | null;
  createdAt!: Date;
}
