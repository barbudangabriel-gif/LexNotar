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
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Request() req, @Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(req.user.officeId, createClientDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clientsService.findAll(req.user.officeId, {
      search,
      type,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.clientsService.getStatistics(req.user.officeId);
  }

  @Get('by-cnp/:cnp')
  findByCnp(@Param('cnp') cnp: string, @Request() req) {
    return this.clientsService.findByCnp(cnp, req.user.officeId);
  }

  @Get('by-cui/:cui')
  findByCui(@Param('cui') cui: string, @Request() req) {
    return this.clientsService.findByCui(cui, req.user.officeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientsService.findOne(id, req.user.officeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, req.user.officeId, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.clientsService.remove(id, req.user.officeId);
  }
}
