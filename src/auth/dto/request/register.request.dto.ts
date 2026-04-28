// src/auth/dto/request/register.request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Min 6 karakter' })
  @IsString()
  @MinLength(6)
  password!: string;
}