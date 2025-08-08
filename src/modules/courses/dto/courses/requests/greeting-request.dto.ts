import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class GreetingRequestDto {
  @ApiProperty({
    description: 'Name to greet',
    example: 'David',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;
}
