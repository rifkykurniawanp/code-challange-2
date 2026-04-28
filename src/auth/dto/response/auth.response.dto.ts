// src/auth/dto/response/auth.response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'Login berhasil' })
  message!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({
    example: {
      id: 'uuid',
      username: 'johndoe',
      email: 'johndoe@example.com',
      createdAt: '2026-04-22T08:15:00Z',
    },
  })
  user!: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  };

  constructor(partial: AuthResponseDto) {
    Object.assign(this, partial);
  }
}