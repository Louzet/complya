import type { Cuid } from './common.types';
import type { OrganizationRole } from './organization.types';

export interface User {
  id: Cuid;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithOrganizations extends User {
  organizations: Array<{
    orgId: Cuid;
    role: OrganizationRole;
  }>;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
}
