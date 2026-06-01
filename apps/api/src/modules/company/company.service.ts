import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import type { Company } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { CompanyResponseDto } from "./dto/company-response.dto";

// satisfies garantit que COMPANY_SELECT couvre exactement les clés de CompanyResponseDto.
// Ajouter un champ à CompanyResponseDto sans l'ajouter ici = erreur TS.
const COMPANY_SELECT = {
  id: true,
  orgId: true,
  name: true,
  nif: true,
  cnssNumber: true,
  cnamgsNumber: true,
  country: true,
  currency: true,
  description: true,
  createdAt: true,
} satisfies Record<keyof CompanyResponseDto, boolean>;

type CompanyRow = Pick<Company, keyof typeof COMPANY_SELECT>;

function toDto(company: CompanyRow): CompanyResponseDto {
  return {
    id: company.id,
    orgId: company.orgId,
    name: company.name,
    nif: company.nif,
    cnssNumber: company.cnssNumber,
    cnamgsNumber: company.cnamgsNumber,
    country: company.country,
    currency: company.currency,
    description: company.description,
    createdAt: company.createdAt,
  };
}

export interface PaginatedCompanies {
  data: CompanyResponseDto[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCompanyDto,
    orgId: string,
    clerkUserId: string,
  ): Promise<CompanyResponseDto> {
    await this.assertOrgMembership(orgId, clerkUserId);

    const existing = await this.prisma.company.findFirst({
      where: { orgId, name: dto.name },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `Une entreprise nommée "${dto.name}" existe déjà dans cette organisation`,
      );
    }

    const company = await this.prisma.company.create({
      data: {
        orgId,
        name: dto.name,
        ...(dto.nif !== undefined && { nif: dto.nif }),
        ...(dto.cnssNumber !== undefined && { cnssNumber: dto.cnssNumber }),
        ...(dto.cnamgsNumber !== undefined && {
          cnamgsNumber: dto.cnamgsNumber,
        }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      select: COMPANY_SELECT,
    });

    return toDto(company);
  }

  async findAll(
    orgId: string,
    clerkUserId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedCompanies> {
    await this.assertOrgMembership(orgId, clerkUserId);

    const skip = (page - 1) * limit;

    // Promise.all suffit — pas besoin d'atomicité transactionnelle pour un count + findMany
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where: { orgId },
        select: COMPANY_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where: { orgId } }),
    ]);

    return { data: companies.map(toDto), total, page, limit };
  }

  async findOne(
    id: string,
    orgId: string,
    clerkUserId: string,
  ): Promise<CompanyResponseDto> {
    await this.assertOrgMembership(orgId, clerkUserId);

    const company = await this.prisma.company.findFirst({
      where: { id, orgId },
      select: COMPANY_SELECT,
    });
    if (!company) {
      throw new NotFoundException(`Entreprise introuvable : ${id}`);
    }

    return toDto(company);
  }

  async update(
    id: string,
    orgId: string,
    dto: UpdateCompanyDto,
    clerkUserId: string,
  ): Promise<CompanyResponseDto> {
    await this.assertOrgMembership(orgId, clerkUserId, [
      OrganizationRole.ORG_OWNER,
      OrganizationRole.ORG_ADMIN,
    ]);

    if (dto.name !== undefined) {
      const conflict = await this.prisma.company.findFirst({
        where: { orgId, name: dto.name, NOT: { id } },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException(
          `Une entreprise nommée "${dto.name}" existe déjà dans cette organisation`,
        );
      }
    }

    // updateMany scoped par orgId — atomique, élimine la race condition exists-then-act
    const result = await this.prisma.company.updateMany({
      where: { id, orgId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.nif !== undefined && { nif: dto.nif }),
        ...(dto.cnssNumber !== undefined && { cnssNumber: dto.cnssNumber }),
        ...(dto.cnamgsNumber !== undefined && {
          cnamgsNumber: dto.cnamgsNumber,
        }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Entreprise introuvable : ${id}`);
    }

    const company = await this.prisma.company.findFirst({
      where: { id, orgId },
      select: COMPANY_SELECT,
    });

    return toDto(company!);
  }

  async remove(id: string, orgId: string, clerkUserId: string): Promise<void> {
    await this.assertOrgMembership(orgId, clerkUserId, [
      OrganizationRole.ORG_OWNER,
    ]);

    // deleteMany scoped par orgId — atomique, élimine la race condition exists-then-delete
    const result = await this.prisma.company.deleteMany({
      where: { id, orgId },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Entreprise introuvable : ${id}`);
    }
  }

  // Deux étapes distinctes : membre ? → 404 si non. Bon rôle ? → 403 si non.
  // Un non-membre sur une route à rôle reçoit 404 (ne révèle pas l'existence de l'org).
  private async assertOrgMembership(
    orgId: string,
    clerkUserId: string,
    roles?: OrganizationRole[],
  ): Promise<void> {
    const membership = await this.prisma.userOrganization.findFirst({
      where: { orgId, user: { clerkUserId } },
      select: { role: true },
    });

    if (!membership) {
      throw new NotFoundException(`Organisation introuvable : ${orgId}`);
    }

    if (roles && !roles.includes(membership.role)) {
      throw new ForbiddenException("Droits insuffisants pour cette opération");
    }
  }
}
