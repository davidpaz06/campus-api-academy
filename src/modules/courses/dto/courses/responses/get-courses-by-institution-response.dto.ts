import { ApiProperty } from '@nestjs/swagger';
import { CourseDto } from '../common/course.dto';
import { PageInfoDto } from '../common/page-info.dto';

export class GetCoursesByInstitutionResponseDto {
  @ApiProperty({
    description: 'Array of courses',
    type: [CourseDto],
  })
  courses!: CourseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PageInfoDto,
  })
  pageInfo!: PageInfoDto;
}
