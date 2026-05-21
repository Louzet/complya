import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationDto } from './dto/organization-response.dto';
import type { Organization } from '@prisma/client';

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
    _clerkUserId: string,
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

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      select: ORG_SELECT,
    });

    return toDto(org);
  }

  async findAll(_clerkUserId: string): Promise<OrganizationDto[]> {
    const orgs = await this.prisma.organization.findMany({
      select: ORG_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return orgs.map(toDto);
  }

  async findOne(id: string, _clerkUserId: string): Promise<OrganizationDto> {
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
    _clerkUserId: string,
  ): Promise<OrganizationDto> {
    const current = await this.prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!current) {
      throw new NotFoundException(`Organisation introuvable : ${id}`);
    }

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

  async remove(id: string, _clerkUserId: string): Promise<void> {
    const existing = await this.prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Organisation introuvable : ${id}`);
    }
    await this.prisma.organization.delete({ where: { id } });
  }
}
