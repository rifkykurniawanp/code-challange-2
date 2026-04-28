// src/threads/dto/request/create-thread.request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateThreadRequestDto {
  @ApiProperty({
    example: 'How do I set up environment variables in Node.js?',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    example: 'I am new to backend development and confused about...',
  })
  @IsString()
  @MinLength(10)
  content!: string;
}