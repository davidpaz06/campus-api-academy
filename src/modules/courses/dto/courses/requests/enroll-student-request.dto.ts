import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class EnrollStudentRequestDto {
  @ApiProperty({ description: 'Campus user ID of the student' })
  @IsUUID()
  @IsNotEmpty()
  campusUserId!: string;

  @ApiProperty({ description: 'Component ID to enroll in' })
  @IsUUID()
  @IsNotEmpty()
  componentId!: string;
}
