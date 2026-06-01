import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { AuthGuard } from "../auth/auth.guard";

const mockCompanyService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockReq = { auth: { userId: "user_clerk" } };
const ORG_ID = "org_1";
const COMPANY_ID = "cmp_1";

describe("CompanyController", () => {
  let controller: CompanyController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: mockCompanyService }],
    })
      // AuthGuard dépend de ConfigService — neutralisé ici, on teste la délégation.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it("is defined", () => {
    expect(controller).toBeDefined();
  });

  it("create — delegates to service with orgId and clerkUserId", async () => {
    const dto = { name: "PME Test" };
    await controller.create(mockReq, ORG_ID, dto as never);
    expect(mockCompanyService.create).toHaveBeenCalledWith(
      dto,
      ORG_ID,
      mockReq.auth.userId,
    );
  });

  it("findAll — passes parsed pagination params", async () => {
    await controller.findAll(mockReq, ORG_ID, "2", "10");
    expect(mockCompanyService.findAll).toHaveBeenCalledWith(
      ORG_ID,
      mockReq.auth.userId,
      2,
      10,
    );
  });

  it("findOne — delegates with id and orgId", async () => {
    await controller.findOne(mockReq, ORG_ID, COMPANY_ID);
    expect(mockCompanyService.findOne).toHaveBeenCalledWith(
      COMPANY_ID,
      ORG_ID,
      mockReq.auth.userId,
    );
  });

  it("update — delegates with id, orgId and dto", async () => {
    const dto = { name: "Nouveau Nom" };
    await controller.update(mockReq, ORG_ID, COMPANY_ID, dto as never);
    expect(mockCompanyService.update).toHaveBeenCalledWith(
      COMPANY_ID,
      ORG_ID,
      dto,
      mockReq.auth.userId,
    );
  });

  it("remove — delegates with id and orgId", async () => {
    await controller.remove(mockReq, ORG_ID, COMPANY_ID);
    expect(mockCompanyService.remove).toHaveBeenCalledWith(
      COMPANY_ID,
      ORG_ID,
      mockReq.auth.userId,
    );
  });
});
