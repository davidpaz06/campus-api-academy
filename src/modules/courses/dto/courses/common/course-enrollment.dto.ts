import { ApiProperty } from '@nestjs/swagger';

export class CourseEnrollmentDto {
  @ApiProperty({ description: 'Course enrollment ID' })
  courseEnrollmentId!: string;

  @ApiProperty({ description: 'Course ID' })
  courseId!: string;

  @ApiProperty({ description: 'Campus user ID of the enrolled student' })
  campusUserId!: string;

  @ApiProperty({ description: 'Enrollment timestamp' })
  enrolledAt!: string;
}
