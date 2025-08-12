import { ApiProperty } from '@nestjs/swagger';

export class ComponentDto {
  @ApiProperty({ description: 'Component ID' })
  componentId!: string;

  @ApiProperty({ description: 'Component name' })
  componentName!: string;

  @ApiProperty({ description: 'Component summary' })
  componentSummary!: string;

  @ApiProperty({
    description: 'Context body',
    required: false,
  })
  contextBody?: string;

  @ApiProperty({ description: 'Component type ID' })
  componentTypeId!: number;

  @ApiProperty({ description: 'Position in course' })
  position!: number;

  @ApiProperty({
    description: 'Parent component ID',
    required: false,
  })
  parentId?: string;

  @ApiProperty({ description: 'Course ID this component belongs to' })
  courseId!: string;

  @ApiProperty({
    description: 'Array of file IDs',
    type: [String],
  })
  fileIds!: string[];
}
