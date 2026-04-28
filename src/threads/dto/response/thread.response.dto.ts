import { ApiProperty } from '@nestjs/swagger';

class ThreadAuthorDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'johndoe' })
  username!: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email!: string;
}

export class ThreadResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'How do I set up environment variables?' })
  title!: string;

  @ApiProperty({ example: 'I am new to backend development...' })
  content!: string;

  @ApiProperty({ example: '2026-04-22T08:15:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-04-22T08:15:00Z' })
  updatedAt!: Date;

  @ApiProperty({ type: ThreadAuthorDto })
  author!: ThreadAuthorDto;

  constructor(partial: ThreadResponseDto) {
    Object.assign(this, partial);
  }
}

export class DeleteThreadResponseDto {
  @ApiProperty({ example: 'Thread berhasil dihapus' })
  message!: string;

  constructor(partial: DeleteThreadResponseDto) {
    Object.assign(this, partial);
  }
}