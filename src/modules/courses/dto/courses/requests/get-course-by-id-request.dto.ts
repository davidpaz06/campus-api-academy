import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class GetCourseByIdRequestDto {
  @ApiProperty({ description: 'The ID of the course to retrieve' })
  @IsString()
  @IsNotEmpty()
  @MinLength(36)
  id!: string;
}
