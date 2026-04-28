import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ThreadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Select shape yang dipakai untuk semua query list/detail
  // user di-rename jadi author agar lebih ekspresif di response
  private readonly select = {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    userId: true, // dibutuhkan Service untuk ownership check
    user: {
      select: { id: true, username: true, email: true },
    },
  };

  async create(data: { title: string; content: string; userId: string }) {
    return this.prisma.thread.create({
      data,
      select: this.select,
    });
  }

  async findAll() {
    return this.prisma.thread.findMany({
      select: this.select,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.thread.findMany({
      where: { userId },
      select: this.select,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.thread.findUnique({
      where: { id },
      select: this.select,
    });
  }

  async update(
    id: string,
    data: { title?: string; content?: string },
  ) {
    return this.prisma.thread.update({
      where: { id },
      data,
      select: this.select,
    });
  }

  async delete(id: string) {
    return this.prisma.thread.delete({
      where: { id },
      select: { id: true, title: true },
    });
  }
}