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
  Req,
  UseGuards,
} from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { AuthGuard } from "../auth/auth.guard";

interface RequestWithAuth {
  auth: { userId: string; sessionId: string };
}

@UseGuards(AuthGuard)
@Controller("organizations")
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Post()
  create(@Req() req: RequestWithAuth, @Body() dto: CreateOrganizationDto) {
    return this.service.create(dto, req.auth.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithAuth) {
    return this.service.findAll(req.auth.userId);
  }

  @Get(":id")
  findOne(@Req() req: RequestWithAuth, @Param("id") id: string) {
    return this.service.findOne(id, req.auth.userId);
  }

  @Patch(":id")
  update(
    @Req() req: RequestWithAuth,
    @Param("id") id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.service.update(id, dto, req.auth.userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: RequestWithAuth, @Param("id") id: string) {
    return this.service.remove(id, req.auth.userId);
  }
}
