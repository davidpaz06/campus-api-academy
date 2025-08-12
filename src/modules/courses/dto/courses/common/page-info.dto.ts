import { ApiProperty } from '@nestjs/swagger';

export class PageInfoDto {
  @ApiProperty({
    description: 'Cursor for next page',
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'Cursor for previous page',
    required: false,
  })
  previousCursor?: string;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage!: boolean;
}
