import { ApiProperty } from '@nestjs/swagger';
import { CourseDto } from '../common/course.dto';

export class UpdateCourseResponseDto {
  @ApiProperty({
    description: 'Updated course data',
    type: CourseDto,
  })
  course!: CourseDto;
}
