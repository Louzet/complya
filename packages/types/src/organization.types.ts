import type { Cuid } from './common.types';

export type OrganizationRole = 'ORG_OWNER' | 'ORG_ADMIN' | 'ORG_MEMBER';

export interface Organization {
  id: Cuid;
  name: string;
  slug: string;
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
}

export interface UpdateOrganizationDto {
  name?: string;
}
