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
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

// TODO: Restore @UseGuards(AuthGuard) and req.auth.userId once testing is done
const DEV_USER = 'dev-bypass';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto, DEV_USER);
  }

  @Get()
  findAll() {
    return this.service.findAll(DEV_USER);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, DEV_USER);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto, DEV_USER);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id, DEV_USER);
  }
}
