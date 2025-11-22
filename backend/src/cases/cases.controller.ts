import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CaseStatus } from '@prisma/client';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Request() req, @Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(
      req.user.userId,
      req.user.officeId,
      createCaseDto,
    );
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: CaseStatus) {
    return this.casesService.findAll(req.user.officeId, status);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.casesService.getStatistics(req.user.officeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.casesService.findOne(id, req.user.officeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCaseDto: UpdateCaseDto,
  ) {
    return this.casesService.update(id, req.user.officeId, updateCaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.casesService.remove(id, req.user.officeId);
  }

  @Post(':id/parties')
  addParty(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { role: string; clientId?: string },
  ) {
    return this.casesService.addParty(
      id,
      req.user.officeId,
      body.role,
      body.clientId,
    );
  }

  @Delete(':caseId/parties/:partyId')
  removeParty(
    @Param('caseId') caseId: string,
    @Param('partyId') partyId: string,
    @Request() req,
  ) {
    return this.casesService.removeParty(partyId, caseId, req.user.officeId);
  }
}
