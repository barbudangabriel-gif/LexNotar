import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentVersionsService {
  constructor(private prisma: PrismaService) {}

  async createVersion(
    documentId: string,
    file: Express.Multer.File,
    userId: string,
    changesSummary?: string,
  ) {
    // Get the document
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Calculate next version number
    const nextVersion = document.versions.length > 0 
      ? document.versions[0].versionNumber + 1 
      : 1;

    // Create version record
    const version = await this.prisma.documentVersion.create({
      data: {
        versionNumber: nextVersion,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        changesSummary,
        documentId,
        createdById: userId,
      },
      include: {
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

    // Update document's main file info
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return version;
  }

  async getVersions(documentId: string) {
    const versions = await this.prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    return versions;
  }

  async getVersion(versionId: string) {
    const version = await this.prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        document: true,
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

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return version;
  }

  async revertToVersion(documentId: string, versionId: string, userId: string) {
    const version = await this.getVersion(versionId);

    if (version.documentId !== documentId) {
      throw new Error('Version does not belong to this document');
    }

    // Copy the version file to a new location
    const oldPath = version.filePath;
    const newPath = oldPath.replace(/\/versions\//, '/current/');
    
    // Ensure directory exists
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(oldPath, newPath);

    // Create a new version from the reverted content
    const newVersion = await this.prisma.documentVersion.create({
      data: {
        versionNumber: version.versionNumber + 1000, // Add large offset to indicate revert
        fileName: version.fileName,
        filePath: newPath,
        fileSize: version.fileSize,
        mimeType: version.mimeType,
        changesSummary: `Reverted to version ${version.versionNumber}`,
        documentId,
        createdById: userId,
      },
    });

    // Update document
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        fileName: version.fileName,
        filePath: newPath,
        fileSize: version.fileSize,
        mimeType: version.mimeType,
      },
    });

    return newVersion;
  }

  async deleteVersion(versionId: string) {
    const version = await this.getVersion(versionId);

    // Delete file from filesystem
    if (fs.existsSync(version.filePath)) {
      fs.unlinkSync(version.filePath);
    }

    // Delete from database
    await this.prisma.documentVersion.delete({
      where: { id: versionId },
    });

    return { message: 'Version deleted successfully' };
  }

  async compareVersions(versionId1: string, versionId2: string) {
    const [version1, version2] = await Promise.all([
      this.getVersion(versionId1),
      this.getVersion(versionId2),
    ]);

    return {
      version1: {
        versionNumber: version1.versionNumber,
        fileName: version1.fileName,
        fileSize: version1.fileSize,
        createdAt: version1.createdAt,
        createdBy: version1.createdBy,
      },
      version2: {
        versionNumber: version2.versionNumber,
        fileName: version2.fileName,
        fileSize: version2.fileSize,
        createdAt: version2.createdAt,
        createdBy: version2.createdBy,
      },
      differences: {
        sizeChange: version2.fileSize - version1.fileSize,
        fileNameChanged: version1.fileName !== version2.fileName,
        mimeTypeChanged: version1.mimeType !== version2.mimeType,
      },
    };
  }
}
