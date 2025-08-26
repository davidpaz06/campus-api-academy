import { ApiProperty } from '@nestjs/swagger';

export class PageInfoDto {
  @ApiProperty({
    description: 'Cursor for next page',
    required: false,
  })
  nextCursor?: string | null;

  @ApiProperty({
    description: 'Cursor for previous page',
    required: false,
  })
  previousCursor?: string | null;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage!: boolean;
}
