import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(officeId: string, createClientDto: CreateClientDto): Promise<Client> {
    // Check for duplicates based on CNP or CUI
    if (createClientDto.cnp) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cnp: createClientDto.cnp,
          officeId,
        },
      });
      if (existing) {
        throw new ConflictException(`Client with CNP ${createClientDto.cnp} already exists`);
      }
    }

    if (createClientDto.cui) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cui: createClientDto.cui,
          officeId,
        },
      });
      if (existing) {
        throw new ConflictException(`Client with CUI ${createClientDto.cui} already exists`);
      }
    }

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        officeId,
      },
    });
  }

  async findAll(
    officeId: string,
    options?: {
      search?: string;
      type?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { search, type, page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      officeId,
      ...(type && { type }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { cnp: { contains: search, mode: 'insensitive' } },
          { cui: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              caseParties: true,
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, officeId: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        officeId,
      },
      include: {
        caseParties: {
          include: {
            case: {
              select: {
                id: true,
                caseNumber: true,
                type: true,
                status: true,
                title: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async findByCnp(cnp: string, officeId: string) {
    return this.prisma.client.findFirst({
      where: {
        cnp,
        officeId,
      },
    });
  }

  async findByCui(cui: string, officeId: string) {
    return this.prisma.client.findFirst({
      where: {
        cui,
        officeId,
      },
    });
  }

  async update(id: string, officeId: string, updateClientDto: UpdateClientDto) {
    // Verify client exists and belongs to office
    await this.findOne(id, officeId);

    // Check for duplicates if CNP or CUI is being updated
    if (updateClientDto.cnp) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cnp: updateClientDto.cnp,
          officeId,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Another client with CNP ${updateClientDto.cnp} already exists`);
      }
    }

    if (updateClientDto.cui) {
      const existing = await this.prisma.client.findFirst({
        where: {
          cui: updateClientDto.cui,
          officeId,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Another client with CUI ${updateClientDto.cui} already exists`);
      }
    }

    // Build update data object
    const updateData: any = {};
    Object.keys(updateClientDto).forEach(key => {
      if (updateClientDto[key as keyof UpdateClientDto] !== undefined) {
        updateData[key] = updateClientDto[key as keyof UpdateClientDto];
      }
    });

    return this.prisma.client.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, officeId: string) {
    // Verify client exists and belongs to office
    const client = await this.findOne(id, officeId);

    // Check if client has associated cases
    if (client.caseParties.length > 0) {
      throw new ConflictException(
        `Cannot delete client with ${client.caseParties.length} associated case(s)`,
      );
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }

  async getStatistics(officeId: string) {
    const [total, individuals, legalEntities] = await Promise.all([
      this.prisma.client.count({ where: { officeId } }),
      this.prisma.client.count({ where: { officeId, type: 'INDIVIDUAL' } }),
      this.prisma.client.count({ where: { officeId, type: 'LEGAL_ENTITY' } }),
    ]);

    return {
      total,
      individuals,
      legalEntities,
    };
  }
}
