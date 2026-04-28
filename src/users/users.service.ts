// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UserResponseDto } from './dto/response/user.response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) throw new NotFoundException(`User dengan id "${id}" tidak ditemukan`);

    // Flatten _count sebelum masuk ke ResponseDto
    return new UserResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      threadCount: user._count.threads,
    });
  }
}