import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface TemplateData {
  [key: string]: any;
}

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  private readonly templates = {
    'sale-purchase-agreement': {
      title: 'Contract de Vânzare-Cumpărare',
      fields: ['sellerName', 'buyerName', 'propertyAddress', 'price', 'date', 'caseNumber'],
    },
    'power-of-attorney': {
      title: 'Procură Specială',
      fields: ['principalName', 'agentName', 'purpose', 'duration', 'date', 'caseNumber'],
    },
    'deed-of-donation': {
      title: 'Contract de Donație',
      fields: ['donorName', 'beneficiaryName', 'propertyDescription', 'date', 'caseNumber'],
    },
    'lease-agreement': {
      title: 'Contract de Închiriere',
      fields: ['landlordName', 'tenantName', 'propertyAddress', 'monthlyRent', 'duration', 'date', 'caseNumber'],
    },
  };

  getAvailableTemplates() {
    return Object.entries(this.templates).map(([key, value]) => ({
      id: key,
      title: value.title,
      fields: value.fields,
    }));
  }

  getTemplate(templateId: string) {
    const template = this.templates[templateId];
    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }
    return { id: templateId, ...template };
  }

  async generatePDF(templateId: string, data: TemplateData): Promise<Buffer> {
    const template = this.templates[templateId];
    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Call the appropriate template generator
      switch (templateId) {
        case 'sale-purchase-agreement':
          this.generateSalePurchaseAgreement(doc, data);
          break;
        case 'power-of-attorney':
          this.generatePowerOfAttorney(doc, data);
          break;
        case 'deed-of-donation':
          this.generateDeedOfDonation(doc, data);
          break;
        case 'lease-agreement':
          this.generateLeaseAgreement(doc, data);
          break;
        default:
          this.generateGenericDocument(doc, template.title, data);
      }

      doc.end();
    });
  }

  private generateSalePurchaseAgreement(doc: typeof PDFDocument, data: TemplateData) {
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('CONTRACT DE VÂNZARE-CUMPĂRARE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Nr. ${data.caseNumber || 'N/A'}`, { align: 'right' });
    doc.text(`Data: ${data.date || new Date().toLocaleDateString('ro-RO')}`, { align: 'right' });
    doc.moveDown(2);

    // Content
    doc.fontSize(12).font('Helvetica-Bold').text('PĂRȚILE CONTRACTANTE:');
    doc.moveDown();
    
    doc.fontSize(11).font('Helvetica').text(`VÂNZĂTOR: ${data.sellerName || '[Nume vânzător]'}`, { indent: 20 });
    doc.moveDown(0.5);
    doc.text(`CUMPĂRĂTOR: ${data.buyerName || '[Nume cumpărător]'}`, { indent: 20 });
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica-Bold').text('OBIECTUL CONTRACTULUI:');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(
      `Prin prezentul contract, vânzătorul transmite proprietatea bunului imobil situat în ${data.propertyAddress || '[Adresă proprietate]'} către cumpărător, în schimbul sumei de ${data.price || '[Preț]'} RON.`,
      { indent: 20, align: 'justify' }
    );
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica-Bold').text('PREȚUL:');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`Suma totală: ${data.price || '[Preț]'} RON`, { indent: 20 });
    doc.moveDown(2);

    // Signatures
    doc.moveDown(3);
    doc.fontSize(11).font('Helvetica');
    const pageWidth = doc.page.width;
    const centerX = pageWidth / 2;
    
    doc.text('VÂNZĂTOR,', centerX - 200, doc.y, { width: 150, align: 'center' });
    doc.text('CUMPĂRĂTOR,', centerX + 50, doc.y - 15, { width: 150, align: 'center' });
    
    doc.moveDown(3);
    doc.text('_________________', centerX - 200, doc.y, { width: 150, align: 'center' });
    doc.text('_________________', centerX + 50, doc.y - 15, { width: 150, align: 'center' });

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      'Document generat de LexNotar - Sistem de Management pentru Notari',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  private generatePowerOfAttorney(doc: typeof PDFDocument, data: TemplateData) {
    doc.fontSize(20).font('Helvetica-Bold').text('PROCURĂ SPECIALĂ', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Nr. ${data.caseNumber || 'N/A'}`, { align: 'right' });
    doc.text(`Data: ${data.date || new Date().toLocaleDateString('ro-RO')}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(11).font('Helvetica').text(
      `Subsemnatul/a, ${data.principalName || '[Nume mandant]'}, declar prin prezenta că îl/o împuternicesc pe ${data.agentName || '[Nume mandatar]'} să mă reprezinte în scopul: ${data.purpose || '[Scopul procurii]'}.`,
      { indent: 20, align: 'justify' }
    );
    doc.moveDown();
    doc.text(`Durata procurii: ${data.duration || '[Durată]'}`, { indent: 20 });
    doc.moveDown(3);

    doc.text('MANDANT,', 100, doc.y);
    doc.text('MANDATAR,', 350, doc.y - 15);
    doc.moveDown(3);
    doc.text('_________________', 100, doc.y);
    doc.text('_________________', 350, doc.y - 15);
  }

  private generateDeedOfDonation(doc: typeof PDFDocument, data: TemplateData) {
    doc.fontSize(20).font('Helvetica-Bold').text('CONTRACT DE DONAȚIE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Nr. ${data.caseNumber || 'N/A'}`, { align: 'right' });
    doc.text(`Data: ${data.date || new Date().toLocaleDateString('ro-RO')}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(11).font('Helvetica').text(
      `Subsemnatul/a, ${data.donorName || '[Nume donator]'}, donez prin prezenta către ${data.beneficiaryName || '[Nume beneficiar]'} următorul bun: ${data.propertyDescription || '[Descriere bun]'}.`,
      { indent: 20, align: 'justify' }
    );
    doc.moveDown(3);

    doc.text('DONATOR,', 100, doc.y);
    doc.text('BENEFICIAR,', 350, doc.y - 15);
    doc.moveDown(3);
    doc.text('_________________', 100, doc.y);
    doc.text('_________________', 350, doc.y - 15);
  }

  private generateLeaseAgreement(doc: typeof PDFDocument, data: TemplateData) {
    doc.fontSize(20).font('Helvetica-Bold').text('CONTRACT DE ÎNCHIRIERE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Nr. ${data.caseNumber || 'N/A'}`, { align: 'right' });
    doc.text(`Data: ${data.date || new Date().toLocaleDateString('ro-RO')}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica-Bold').text('PĂRȚILE:');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`LOCATOR: ${data.landlordName || '[Nume locator]'}`, { indent: 20 });
    doc.text(`LOCATAR: ${data.tenantName || '[Nume locatar]'}`, { indent: 20 });
    doc.moveDown(2);

    doc.fontSize(12).font('Helvetica-Bold').text('OBIECTUL CONTRACTULUI:');
    doc.moveDown();
    doc.fontSize(11).font('Helvetica').text(`Proprietate: ${data.propertyAddress || '[Adresă]'}`, { indent: 20 });
    doc.text(`Chirie lunară: ${data.monthlyRent || '[Sumă]'} RON`, { indent: 20 });
    doc.text(`Durată: ${data.duration || '[Durată]'}`, { indent: 20 });
    doc.moveDown(3);

    doc.text('LOCATOR,', 100, doc.y);
    doc.text('LOCATAR,', 350, doc.y - 15);
    doc.moveDown(3);
    doc.text('_________________', 100, doc.y);
    doc.text('_________________', 350, doc.y - 15);
  }

  private generateGenericDocument(doc: typeof PDFDocument, title: string, data: TemplateData) {
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(2);

    Object.entries(data).forEach(([key, value]) => {
      doc.fontSize(12).font('Helvetica').text(`${key}: ${value}`);
      doc.moveDown();
    });
  }
}
