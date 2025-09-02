import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComponentRequestDto {
  @ApiProperty({ description: 'Name of the component' })
  @IsString()
  @IsNotEmpty()
  componentName!: string;

  @ApiProperty({ description: 'Summary of the component' })
  @IsString()
  @IsNotEmpty()
  componentSummary!: string;

  @ApiProperty({ description: 'Type ID of the component' })
  @IsInt()
  @Min(1)
  componentTypeId!: number;

  @ApiProperty({
    description: 'Context body of the component',
    required: false,
  })
  @IsOptional()
  @IsString()
  contextBody?: string;

  @ApiProperty({ description: 'Position of the component' })
  @IsInt()
  @Min(0)
  position!: number;

  @ApiProperty({
    description: 'Temporary parent ID for mapping',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentTempId?: string;

  @ApiProperty({ description: 'Real parent ID if exists', required: false })
  @IsOptional()
  @IsUUID()
  realParentId?: string;

  @ApiProperty({
    description: 'Array of file IDs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileIds?: string[];
}

export class CreateCourseRequestDto {
  @ApiProperty({ description: 'Name of the course' })
  @IsString()
  @IsNotEmpty()
  courseName!: string;

  @ApiProperty({ description: 'Summary of the course' })
  @IsString()
  @IsNotEmpty()
  courseSummary!: string;

  @ApiProperty({ description: 'Description of the course', required: true })
  @IsOptional()
  @IsString()
  courseDescription!: string;

  @ApiProperty({ description: 'Institution ID' })
  @IsUUID()
  @IsNotEmpty()
  institutionId!: string;

  @ApiProperty({ description: 'Course image ID', required: false })
  @IsOptional()
  @IsUUID()
  courseImageId?: string;

  @ApiProperty({
    description: 'Array of components',
    type: [ComponentRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentRequestDto)
  components!: ComponentRequestDto[];
}
