import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
  }

  /**
   * Cek apakah email atau username sudah dipakai — dipakai saat register.
   */
  async findByEmailOrUsername(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  }
}