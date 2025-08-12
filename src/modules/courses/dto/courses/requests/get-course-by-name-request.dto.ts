import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class GetCourseByNameRequestDto {
  @ApiProperty({ description: 'Name of the course to search' })
  @IsString()
  @IsNotEmpty()
  courseName!: string;

  @ApiProperty({ description: 'Institution ID' })
  @IsUUID()
  @IsNotEmpty()
  institutionId!: string;

  @ApiProperty({
    description: 'Cursor for pagination',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Limit of results',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}
