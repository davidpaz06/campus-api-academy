import { ApiProperty } from '@nestjs/swagger';
import { CourseEnrollmentDto } from '../common/course-enrollment.dto';
import { PageInfoDto } from '../common/page-info.dto';

export class GetCourseEnrollmentsResponseDto {
  @ApiProperty({
    description: 'Array of course enrollments',
    type: [CourseEnrollmentDto],
  })
  enrollments!: CourseEnrollmentDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PageInfoDto,
  })
  pageInfo!: PageInfoDto;
}
