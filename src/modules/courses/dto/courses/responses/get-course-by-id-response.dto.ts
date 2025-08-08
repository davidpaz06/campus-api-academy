import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class GetCourseByIdResponseDto {
  @ApiProperty({ description: 'The ID of the course' })
  @IsString()
  @IsNotEmpty()
  @MinLength(36)
  id!: string;

  @ApiProperty({ description: 'The title of the course' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The description of the course' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
