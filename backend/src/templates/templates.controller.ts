import { Controller, Get, Post, Body, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  getAvailableTemplates() {
    return this.templatesService.getAvailableTemplates();
  }

  @Get(':id')
  getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplate(id);
  }

  @Post(':id/generate')
  async generateDocument(
    @Param('id') id: string,
    @Body() data: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.templatesService.generatePDF(id, data);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${id}-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post(':id/preview')
  async previewDocument(
    @Param('id') id: string,
    @Body() data: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.templatesService.generatePDF(id, data);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(pdfBuffer);
  }
}
