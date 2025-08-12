import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class DeleteCourseRequestDto {
  @ApiProperty({ description: 'Course ID to delete' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;
}
