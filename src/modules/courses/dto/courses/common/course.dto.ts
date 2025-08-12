import { ApiProperty } from '@nestjs/swagger';
import { ComponentDto } from './component.dto';

export class CourseDto {
  @ApiProperty({ description: 'Course ID' })
  courseId!: string;

  @ApiProperty({ description: 'Course name' })
  courseName!: string;

  @ApiProperty({ description: 'Course summary' })
  courseSummary!: string;

  @ApiProperty({
    description: 'Course description',
    required: false,
  })
  courseDescription?: string;

  @ApiProperty({ description: 'Institution ID' })
  institutionId!: string;

  @ApiProperty({
    description: 'Course image ID',
    required: false,
  })
  courseImageId?: string;

  @ApiProperty({
    description: 'Array of course components',
    type: [ComponentDto],
  })
  components!: ComponentDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: string;
}
