import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DocumentVersionsService } from './document-versions.service';

@Controller('documents/:documentId/versions')
@UseGuards(JwtAuthGuard)
export class DocumentVersionsController {
  constructor(private readonly documentVersionsService: DocumentVersionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createVersion(
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('changesSummary') changesSummary: string,
    @Req() req: any,
  ) {
    return this.documentVersionsService.createVersion(
      documentId,
      file,
      req.user.sub,
      changesSummary,
    );
  }

  @Get()
  async getVersions(@Param('documentId') documentId: string) {
    return this.documentVersionsService.getVersions(documentId);
  }

  @Get(':versionId')
  async getVersion(@Param('versionId') versionId: string) {
    return this.documentVersionsService.getVersion(versionId);
  }

  @Post(':versionId/revert')
  async revertToVersion(
    @Param('documentId') documentId: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    return this.documentVersionsService.revertToVersion(documentId, versionId, req.user.sub);
  }

  @Delete(':versionId')
  async deleteVersion(@Param('versionId') versionId: string) {
    return this.documentVersionsService.deleteVersion(versionId);
  }

  @Get('compare')
  async compareVersions(
    @Query('version1') versionId1: string,
    @Query('version2') versionId2: string,
  ) {
    return this.documentVersionsService.compareVersions(versionId1, versionId2);
  }
}
