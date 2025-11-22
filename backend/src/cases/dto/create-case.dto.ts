import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType } from '@prisma/client';

class CasePartyDto {
  @IsString()
  role: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}

export class CreateCaseDto {
  @IsEnum(CaseType)
  type: CaseType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CasePartyDto)
  parties?: CasePartyDto[];
}
