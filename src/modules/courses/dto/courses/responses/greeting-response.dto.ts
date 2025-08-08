import { ApiProperty } from '@nestjs/swagger';

export class GreetingResponseDto {
  @ApiProperty({
    description: 'Greeting message',
    example: 'Hello David from Academy!',
  })
  message!: string;
}
