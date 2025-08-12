import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCourseRequestDto {
  @ApiProperty({ description: 'Course ID to update' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({
    description: 'New name of the course',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiProperty({
    description: 'New summary of the course',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseSummary?: string;

  @ApiProperty({
    description: 'New description of the course',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseDescription?: string;

  @ApiProperty({
    description: 'New course image ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  courseImageId?: string;
}
