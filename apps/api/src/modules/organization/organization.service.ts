import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { OrganizationDto } from "./dto/organization-response.dto";
import type { Organization } from "@prisma/client";

const ORG_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  description: true,
  createdAt: true,
} as const;

type OrgRow = Pick<Organization, keyof typeof ORG_SELECT>;

function toDto(org: OrgRow): OrganizationDto {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    description: org.description,
    createdAt: org.createdAt,
  };
}

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateOrganizationDto,
    clerkUserId: string,
  ): Promise<OrganizationDto> {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `Le slug "${dto.slug}" est déjà utilisé par une autre organisation`,
      );
    }

    // Upsert user — email placeholder jusqu'au webhook Clerk (A02)
    const user = await this.prisma.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        email: `${clerkUserId}@pending.sync`,
      },
      update: {},
      select: { id: true },
    });

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      select: ORG_SELECT,
    });

    await this.prisma.userOrganization.create({
      data: {
        userId: user.id,
        orgId: org.id,
        role: OrganizationRole.ORG_OWNER,
      },
    });

    return toDto(org);
  }

  async findAll(clerkUserId: string): Promise<OrganizationDto[]> {
    const memberships = await this.prisma.userOrganization.findMany({
      where: { user: { clerkUserId } },
      select: { orgId: true },
    });

    if (memberships.length === 0) return [];

    const orgIds = memberships.map((m) => m.orgId);
    const orgs = await this.prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: ORG_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return orgs.map(toDto);
  }

  async findOne(id: string, clerkUserId: string): Promise<OrganizationDto> {
    await this.assertMembership(id, clerkUserId);

    const org = await this.prisma.organization.findUnique({
      where: { id },
      select: ORG_SELECT,
    });
    if (!org) {
      throw new NotFoundException(`Organisation introuvable : ${id}`);
    }
    return toDto(org);
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
    clerkUserId: string,
  ): Promise<OrganizationDto> {
    await this.assertMembership(id, clerkUserId, [
      OrganizationRole.ORG_OWNER,
      OrganizationRole.ORG_ADMIN,
    ]);

    if (dto.slug !== undefined) {
      const conflict = await this.prisma.organization.findUnique({
        where: { slug: dto.slug },
        select: { id: true },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Le slug "${dto.slug}" est déjà utilisé par une autre organisation`,
        );
      }
    }

    const org = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      select: ORG_SELECT,
    });

    return toDto(org);
  }

  async remove(id: string, clerkUserId: string): Promise<void> {
    await this.assertMembership(id, clerkUserId, [OrganizationRole.ORG_OWNER]);
    await this.prisma.organization.delete({ where: { id } });
  }

  // Vérifie que l'utilisateur est membre de l'org (avec rôle optionnel).
  // Retourne 404 pour ne pas révéler l'existence d'une org à un non-membre.
  private async assertMembership(
    orgId: string,
    clerkUserId: string,
    roles?: OrganizationRole[],
  ): Promise<void> {
    const membership = await this.prisma.userOrganization.findFirst({
      where: {
        orgId,
        user: { clerkUserId },
        ...(roles ? { role: { in: roles } } : {}),
      },
    });

    if (!membership) {
      if (roles) {
        throw new ForbiddenException(
          `Droits insuffisants pour cette opération`,
        );
      }
      throw new NotFoundException(`Organisation introuvable : ${orgId}`);
    }
  }
}
