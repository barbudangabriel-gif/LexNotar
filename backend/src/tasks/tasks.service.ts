import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const data: any = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || 'TODO',
      priority: createTaskDto.priority || 'MEDIUM',
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      createdBy: { connect: { id: userId } },
    };

    if (createTaskDto.caseId) {
      data.case = { connect: { id: createTaskDto.caseId } };
    }

    if (createTaskDto.assignedToId) {
      data.assignedTo = { connect: { id: createTaskDto.assignedToId } };
    }

    const task = await this.prisma.task.create({
      data,
      include: {
        case: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send email notification if task is assigned to someone
    if (task.assignedTo) {
      const assignedBy = `${task.createdBy.firstName} ${task.createdBy.lastName}`;
      await this.mailService.sendTaskAssignment(task.assignedTo.email, task, assignedBy);
      
      // Send WebSocket notification
      this.notificationsGateway.notifyTaskAssignment(parseInt(task.assignedTo.id), task);
    }

    return task;
  }

  async findAll(filters?: { caseId?: number; assignedToId?: number; status?: string }) {
    const where: any = {};

    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            type: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const data: any = {};

    if (updateTaskDto.title !== undefined) data.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) data.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) data.status = updateTaskDto.status;
    if (updateTaskDto.priority !== undefined) data.priority = updateTaskDto.priority;
    if (updateTaskDto.dueDate !== undefined) {
      data.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }

    if (updateTaskDto.caseId !== undefined) {
      if (updateTaskDto.caseId === null) {
        data.case = { disconnect: true };
      } else {
        data.case = { connect: { id: updateTaskDto.caseId } };
      }
    }

    if (updateTaskDto.assignedToId !== undefined) {
      if (updateTaskDto.assignedToId === null) {
        data.assignedTo = { disconnect: true };
      } else {
        data.assignedTo = { connect: { id: updateTaskDto.assignedToId } };
      }
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        case: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.prisma.task.delete({ where: { id } });
  }

  // Helper method to get overdue tasks
  async findOverdue() {
    return this.prisma.task.findMany({
      where: {
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: 'DONE',
        },
      },
      include: {
        case: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  // Helper method to get tasks due soon (within next 7 days)
  async findDueSoon(days: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: futureDate,
        },
        status: {
          not: 'DONE',
        },
      },
      include: {
        case: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}
