import { ApiProperty } from '@nestjs/swagger';
import { CourseDto } from '../common/course.dto';

export class CreateCourseResponseDto {
  @ApiProperty({
    description: 'Created course data',
    type: CourseDto,
  })
  course!: CourseDto;
}
