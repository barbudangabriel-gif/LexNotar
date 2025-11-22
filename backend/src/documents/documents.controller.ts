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
  UseInterceptors,
  UploadedFile,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DocumentStatus } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Request() req, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(
      req.user.userId,
      req.user.officeId,
      createDocumentDto,
    );
  }

  @Get()
  findAll(
    @Request() req,
    @Query('caseId') caseId?: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.documentsService.findAll(req.user.officeId, caseId, status);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.documentsService.getStatistics(req.user.officeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.officeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, req.user.officeId, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.remove(id, req.user.officeId);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.uploadFile(id, req.user.officeId, file);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Request() req, @Response({ passthrough: true }) res) {
    const { buffer, fileName, mimeType } = await this.documentsService.downloadFile(
      id,
      req.user.officeId,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(buffer);
  }
}
