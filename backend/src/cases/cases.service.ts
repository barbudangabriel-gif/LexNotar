import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto, UpdateCaseDto } from './dto';
import { Case, CaseStatus } from '@prisma/client';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, officeId: string, createCaseDto: CreateCaseDto): Promise<Case> {
    const caseNumber = await this.generateCaseNumber(officeId);

    const { parties, ...caseData } = createCaseDto;

    const newCase = await this.prisma.case.create({
      data: {
        ...caseData,
        caseNumber,
        status: CaseStatus.DRAFT,
        officeId,
        createdById: userId,
        parties: parties
          ? {
              create: parties.map((party) => ({
                role: party.role,
                clientId: party.clientId,
              })),
            }
          : undefined,
      },
      include: {
        parties: {
          include: {
            client: true,
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return newCase;
  }

  async findAll(officeId: string, status?: CaseStatus) {
    return this.prisma.case.findMany({
      where: {
        officeId,
        ...(status && { status }),
      },
      include: {
        parties: {
          include: {
            client: true,
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            documents: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, officeId: string) {
    const caseRecord = await this.prisma.case.findFirst({
      where: {
        id,
        officeId,
      },
      include: {
        parties: {
          include: {
            client: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        tasks: {
          orderBy: {
            dueDate: 'asc',
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    return caseRecord;
  }

  async update(id: string, officeId: string, updateCaseDto: UpdateCaseDto) {
    // Verify case exists and belongs to office
    await this.findOne(id, officeId);

    // Extract only the fields that can be updated
    const { type, title, description, estimatedValue, actualValue, status, completionDate, startDate, assignedToId } = updateCaseDto;
    const updateData: any = {};
    
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;
    if (actualValue !== undefined) updateData.actualValue = actualValue;
    if (status !== undefined) updateData.status = status;
    if (completionDate !== undefined) updateData.completionDate = completionDate;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

    return this.prisma.case.update({
      where: { id },
      data: updateData,
      include: {
        parties: {
          include: {
            client: true,
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
        assignedTo: {
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
    // Verify case exists and belongs to office
    await this.findOne(id, officeId);

    return this.prisma.case.delete({
      where: { id },
    });
  }

  async addParty(caseId: string, officeId: string, role: string, clientId?: string) {
    // Verify case exists and belongs to office
    await this.findOne(caseId, officeId);

    return this.prisma.caseParty.create({
      data: {
        caseId,
        role,
        clientId,
      },
      include: {
        client: true,
      },
    });
  }

  async removeParty(partyId: string, caseId: string, officeId: string) {
    // Verify case exists and belongs to office
    await this.findOne(caseId, officeId);

    return this.prisma.caseParty.delete({
      where: { id: partyId },
    });
  }

  async getStatistics(officeId: string) {
    const [total, byStatus, byType] = await Promise.all([
      this.prisma.case.count({ where: { officeId } }),
      this.prisma.case.groupBy({
        by: ['status'],
        where: { officeId },
        _count: true,
      }),
      this.prisma.case.groupBy({
        by: ['type'],
        where: { officeId },
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

  private async generateCaseNumber(officeId: string): Promise<string> {
    const year = new Date().getFullYear();
    const office = await this.prisma.office.findUnique({
      where: { id: officeId },
      select: { code: true },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    const count = await this.prisma.case.count({
      where: {
        officeId,
        caseNumber: {
          startsWith: `${office.code}-${year}`,
        },
      },
    });

    const nextNumber = String(count + 1).padStart(4, '0');
    return `${office.code}-${year}-${nextNumber}`;
  }
}
