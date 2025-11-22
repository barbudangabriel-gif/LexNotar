import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';
import { IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { CaseStatus } from '@prisma/client';

export class UpdateCaseDto extends PartialType(CreateCaseDto) {
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsNumber()
  actualValue?: number;

  @IsOptional()
  @IsDateString()
  completionDate?: string;
}
