import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.office.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.office.findMany({
      where: { active: true },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.office.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.office.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.office.update({
      where: { id },
      data: { active: false },
    });
  }
}
