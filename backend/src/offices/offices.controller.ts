import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OfficesService } from './offices.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('offices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get()
  findAll() {
    return this.officesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createOfficeDto: any) {
    return this.officesService.create(createOfficeDto);
  }
}
