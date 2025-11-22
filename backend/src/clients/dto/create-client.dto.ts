import { IsString, IsOptional, IsEnum, IsEmail, ValidateIf } from 'class-validator';

enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
}

export class CreateClientDto {
  @IsEnum(ClientType)
  type: string;

  @ValidateIf((o) => o.type === 'INDIVIDUAL')
  @IsString()
  firstName?: string;

  @ValidateIf((o) => o.type === 'INDIVIDUAL')
  @IsString()
  lastName?: string;

  @ValidateIf((o) => o.type === 'LEGAL_ENTITY')
  @IsString()
  companyName?: string;

  @ValidateIf((o) => o.type === 'INDIVIDUAL')
  @IsOptional()
  @IsString()
  cnp?: string;

  @ValidateIf((o) => o.type === 'LEGAL_ENTITY')
  @IsOptional()
  @IsString()
  cui?: string;

  @IsOptional()
  @IsString()
  idSeries?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  county?: string;
}
