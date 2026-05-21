import type { Cuid } from './common.types';

export type OrganizationRole = 'ORG_OWNER' | 'ORG_ADMIN' | 'ORG_MEMBER';
export type OrgType = 'CABINET' | 'SME';

export interface Organization {
  id: Cuid;
  name: string;
  slug: string;
  type: OrgType;
  description?: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface OrganizationMember {
  userId: Cuid;
  orgId: Cuid;
  role: OrganizationRole;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  type?: OrgType;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
}
