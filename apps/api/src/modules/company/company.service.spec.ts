import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { OrganizationRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompanyService } from "./company.service";
import { PrismaService } from "../../shared/prisma/prisma.service";

const ORG_ID = "org_test";
const COMPANY_ID = "cmp_test";
const CLERK_USER = "user_clerk";

const mockCompany = {
  id: COMPANY_ID,
  orgId: ORG_ID,
  name: "PME Gabon Test",
  nif: null,
  cnssNumber: null,
  cnamgsNumber: null,
  country: "GA",
  currency: "XAF",
  description: null,
  createdAt: new Date("2026-01-01"),
};

const mockPrisma = {
  company: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  userOrganization: {
    findFirst: vi.fn(),
  },
};

function mockMembership(role: OrganizationRole = OrganizationRole.ORG_OWNER) {
  mockPrisma.userOrganization.findFirst.mockResolvedValue({ role });
}

function mockNoMembership() {
  mockPrisma.userOrganization.findFirst.mockResolvedValue(null);
}

describe("CompanyService", () => {
  let service: CompanyService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  // ── create ────────────────────────────────────────────────────────────────────

  describe("create", () => {
    it("creates company and returns dto", async () => {
      mockMembership();
      mockPrisma.company.findFirst.mockResolvedValue(null); // pas de conflit de nom
      mockPrisma.company.create.mockResolvedValue(mockCompany);

      const result = await service.create(
        { name: "PME Gabon Test" },
        ORG_ID,
        CLERK_USER,
      );

      expect(result.id).toBe(COMPANY_ID);
      expect(result.orgId).toBe(ORG_ID);
      expect(result.name).toBe("PME Gabon Test");
      expect(mockPrisma.company.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orgId: ORG_ID,
            name: "PME Gabon Test",
          }),
        }),
      );
    });

    it("throws ConflictException when name already exists in org", async () => {
      mockMembership();
      mockPrisma.company.findFirst.mockResolvedValue({ id: "existing_cmp" });

      await expect(
        service.create({ name: "PME Gabon Test" }, ORG_ID, CLERK_USER),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.company.create).not.toHaveBeenCalled();
    });

    it("throws NotFoundException for non-member (hides org existence)", async () => {
      mockNoMembership();

      await expect(
        service.create({ name: "PME Test" }, ORG_ID, CLERK_USER),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.company.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────────

  describe("findAll", () => {
    it("returns paginated companies scoped to orgId", async () => {
      mockMembership();
      mockPrisma.company.findMany.mockResolvedValue([mockCompany]);
      mockPrisma.company.count.mockResolvedValue(1);

      const result = await service.findAll(ORG_ID, CLERK_USER);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.data[0].orgId).toBe(ORG_ID);
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orgId: ORG_ID },
          skip: 0,
          take: 20,
        }),
      );
      expect(mockPrisma.company.count).toHaveBeenCalledWith({
        where: { orgId: ORG_ID },
      });
    });

    it("applies pagination correctly", async () => {
      mockMembership();
      mockPrisma.company.findMany.mockResolvedValue([]);
      mockPrisma.company.count.mockResolvedValue(30);

      const result = await service.findAll(ORG_ID, CLERK_USER, 2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(30);
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it("throws NotFoundException for non-member", async () => {
      mockNoMembership();

      await expect(service.findAll(ORG_ID, CLERK_USER)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.company.findMany).not.toHaveBeenCalled();
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────────

  describe("findOne", () => {
    it("returns company scoped to orgId", async () => {
      mockMembership();
      mockPrisma.company.findFirst.mockResolvedValue(mockCompany);

      const result = await service.findOne(COMPANY_ID, ORG_ID, CLERK_USER);

      expect(result.id).toBe(COMPANY_ID);
      expect(mockPrisma.company.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: COMPANY_ID, orgId: ORG_ID } }),
      );
    });

    it("throws NotFoundException when company belongs to another org", async () => {
      mockMembership();
      mockPrisma.company.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(COMPANY_ID, ORG_ID, CLERK_USER),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException for non-member", async () => {
      mockNoMembership();

      await expect(
        service.findOne(COMPANY_ID, ORG_ID, CLERK_USER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────────

  describe("update", () => {
    it("updates company for owner", async () => {
      mockMembership(OrganizationRole.ORG_OWNER);
      mockPrisma.company.findFirst
        .mockResolvedValueOnce(null) // pas de conflit de nom
        .mockResolvedValueOnce({ ...mockCompany, name: "Nouveau Nom" }); // fetch final
      mockPrisma.company.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.update(
        COMPANY_ID,
        ORG_ID,
        { name: "Nouveau Nom" },
        CLERK_USER,
      );

      expect(result.name).toBe("Nouveau Nom");
      expect(mockPrisma.company.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: COMPANY_ID, orgId: ORG_ID } }),
      );
    });

    it("updates company for admin", async () => {
      mockMembership(OrganizationRole.ORG_ADMIN);
      mockPrisma.company.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.company.findFirst.mockResolvedValue(mockCompany); // fetch final

      await expect(
        service.update(COMPANY_ID, ORG_ID, { nif: "GA-001" }, CLERK_USER),
      ).resolves.not.toThrow();
    });

    it("throws ForbiddenException for member without admin role", async () => {
      mockMembership(OrganizationRole.ORG_MEMBER);

      await expect(
        service.update(COMPANY_ID, ORG_ID, { name: "X" }, CLERK_USER),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.company.updateMany).not.toHaveBeenCalled();
    });

    it("throws NotFoundException for non-member", async () => {
      mockNoMembership();

      await expect(
        service.update(COMPANY_ID, ORG_ID, { name: "X" }, CLERK_USER),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException when company not in org", async () => {
      mockMembership(OrganizationRole.ORG_OWNER);
      mockPrisma.company.findFirst.mockResolvedValue(null); // pas de conflit
      mockPrisma.company.updateMany.mockResolvedValue({ count: 0 }); // rien mis à jour

      await expect(
        service.update(COMPANY_ID, ORG_ID, { name: "X" }, CLERK_USER),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ConflictException when new name already used in org", async () => {
      mockMembership(OrganizationRole.ORG_OWNER);
      mockPrisma.company.findFirst.mockResolvedValue({ id: "other_cmp" }); // conflit de nom

      await expect(
        service.update(
          COMPANY_ID,
          ORG_ID,
          { name: "PME Existante" },
          CLERK_USER,
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.company.updateMany).not.toHaveBeenCalled();
    });

    it("skips name conflict check when name is not in dto", async () => {
      mockMembership(OrganizationRole.ORG_OWNER);
      mockPrisma.company.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.company.findFirst.mockResolvedValue(mockCompany); // fetch final uniquement

      await service.update(COMPANY_ID, ORG_ID, { nif: "GA-001" }, CLERK_USER);

      // findFirst appelé une seule fois (fetch final), pas pour un check de conflit de nom
      expect(mockPrisma.company.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────

  describe("remove", () => {
    it("deletes company for owner", async () => {
      mockMembership(OrganizationRole.ORG_OWNER);
      mockPrisma.company.deleteMany.mockResolvedValue({ count: 1 });

      await service.remove(COMPANY_ID, ORG_ID, CLERK_USER);

      expect(mockPrisma.company.deleteMany).toHaveBeenCalledWith({
        where: { id: COMPANY_ID, orgId: ORG_ID },
      });
    });

    it("throws ForbiddenException for non-owner", async () => {
      mockMembership(OrganizationRole.ORG_ADMIN);

      await expect(
        service.remove(COMPANY_ID, ORG_ID, CLERK_USER),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.company.deleteMany).not.toHaveBeenCalled();
    });

    it("throws NotFoundException for non-member", async () => {
      mockNoMembership();

      await expect(
        service.remove(COMPANY_ID, ORG_ID, CLERK_USER),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.company.deleteMany).not.toHaveBeenCalled();
    });

    it("throws NotFoundException when company not in org", async () => {
      mockMembership(OrganizationRole.ORG_OWNER);
      mockPrisma.company.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.remove(COMPANY_ID, ORG_ID, CLERK_USER),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
