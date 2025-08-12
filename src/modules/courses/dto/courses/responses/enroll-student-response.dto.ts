import { ApiProperty } from '@nestjs/swagger';
import { CourseEnrollmentDto } from '../common/course-enrollment.dto';

export class EnrollStudentResponseDto {
  @ApiProperty({
    description: 'Created enrollment data',
    type: CourseEnrollmentDto,
  })
  enrollment!: CourseEnrollmentDto;
}
