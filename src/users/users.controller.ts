// src/users/users.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/response/user.response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lihat profil publik user berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'UUID user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }
}