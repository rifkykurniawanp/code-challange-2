import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'johndoe' })
  username!: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email!: string;

  @ApiProperty({ example: '2026-04-22T08:15:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: 2, description: 'Total thread yang dibuat user' })
  threadCount!: number;

  constructor(partial: UserResponseDto) {
    Object.assign(this, partial);
  }
}