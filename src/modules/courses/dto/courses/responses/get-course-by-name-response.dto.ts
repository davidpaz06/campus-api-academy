import { ApiProperty } from '@nestjs/swagger';
import { CourseDto } from '../common/course.dto';
import { PageInfoDto } from '../common/page-info.dto';

export class GetCourseByNameResponseDto {
  @ApiProperty({
    description: 'Array of courses matching the search',
    type: [CourseDto],
  })
  courses!: CourseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PageInfoDto,
  })
  pageInfo?: PageInfoDto;
}
