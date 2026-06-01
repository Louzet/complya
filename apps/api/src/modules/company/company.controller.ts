import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

interface RequestWithAuth {
  auth: { userId: string };
}

@UseGuards(AuthGuard)
@Controller("organizations/:orgId/companies")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(
    @Req() req: RequestWithAuth,
    @Param("orgId") orgId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companyService.create(dto, orgId, req.auth.userId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithAuth,
    @Param("orgId") orgId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedPage = Math.max(1, page ? parseInt(page, 10) : 1);
    const parsedLimit = Math.min(
      100,
      Math.max(1, limit ? parseInt(limit, 10) : 20),
    );
    return this.companyService.findAll(
      orgId,
      req.auth.userId,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(":id")
  findOne(
    @Req() req: RequestWithAuth,
    @Param("orgId") orgId: string,
    @Param("id") id: string,
  ) {
    return this.companyService.findOne(id, orgId, req.auth.userId);
  }

  @Patch(":id")
  update(
    @Req() req: RequestWithAuth,
    @Param("orgId") orgId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, orgId, dto, req.auth.userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Req() req: RequestWithAuth,
    @Param("orgId") orgId: string,
    @Param("id") id: string,
  ) {
    return this.companyService.remove(id, orgId, req.auth.userId);
  }
}
