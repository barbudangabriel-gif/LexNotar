import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { Document, DocumentStatus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'documents');

  constructor(private prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async create(userId: string, officeId: string, createDocumentDto: CreateDocumentDto): Promise<Document> {
    // Verify case exists and belongs to office
    const caseRecord = await this.prisma.case.findFirst({
      where: {
        id: createDocumentDto.caseId,
        officeId,
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    return this.prisma.document.create({
      data: {
        ...createDocumentDto,
        status: DocumentStatus.DRAFT,
        createdById: userId,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(officeId: string, caseId?: string, status?: DocumentStatus) {
    // Build where clause
    const where: any = {};

    if (caseId) {
      // Verify case belongs to office
      const caseRecord = await this.prisma.case.findFirst({
        where: {
          id: caseId,
          officeId,
        },
      });

      if (!caseRecord) {
        throw new NotFoundException('Case not found');
      }

      where.caseId = caseId;
    } else {
      // If no specific case, get documents from all cases in office
      where.case = {
        officeId,
      };
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.document.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            signatures: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, officeId: string) {
    const document = await this.prisma.document.findFirst({
      where: {
        id,
        case: {
          officeId,
        },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        signatures: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async update(id: string, officeId: string, updateDocumentDto: UpdateDocumentDto) {
    // Verify document exists and belongs to office
    await this.findOne(id, officeId);

    return this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, officeId: string) {
    // Verify document exists and belongs to office
    const document = await this.findOne(id, officeId);

    // Delete file if exists
    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async uploadFile(
    documentId: string,
    officeId: string,
    file: Express.Multer.File,
  ) {
    // Verify document exists and belongs to office
    const document = await this.findOne(documentId, officeId);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Update document
    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        fileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  async downloadFile(documentId: string, officeId: string) {
    const document = await this.findOne(documentId, officeId);

    if (!document.filePath) {
      throw new NotFoundException('Document file not found');
    }

    try {
      const fileBuffer = await fs.readFile(document.filePath);
      return {
        buffer: fileBuffer,
        fileName: document.fileName,
        mimeType: document.mimeType,
      };
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  async getStatistics(officeId: string) {
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.document.count({
        where: {
          case: {
            officeId,
          },
        },
      }),
      this.prisma.document.groupBy({
        by: ['status'],
        where: {
          case: {
            officeId,
          },
        },
        _count: true,
      }),
      this.prisma.document.groupBy({
        by: ['type'],
        where: {
          case: {
            officeId,
          },
        },
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
