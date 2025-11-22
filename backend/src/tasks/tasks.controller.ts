import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('caseId') caseId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (caseId) filters.caseId = parseInt(caseId);
    if (assignedToId) filters.assignedToId = parseInt(assignedToId);
    if (status) filters.status = status;

    return this.tasksService.findAll(filters);
  }

  @Get('overdue')
  findOverdue() {
    return this.tasksService.findOverdue();
  }

  @Get('due-soon')
  findDueSoon(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 7;
    return this.tasksService.findDueSoon(daysNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
