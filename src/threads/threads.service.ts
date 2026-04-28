import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ThreadsRepository } from './repositories/threads.repository';
import { CreateThreadRequestDto } from './dto/request/create-thread.request.dto';
import { UpdateThreadRequestDto } from './dto/request/update-thread.request.dto';
import {
  ThreadResponseDto,
  DeleteThreadResponseDto,
} from './dto/response/thread.response.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

type ThreadFromDb = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
};

@Injectable()
export class ThreadsService {
  constructor(private readonly threadsRepository: ThreadsRepository) {}

  private toResponseDto(thread: ThreadFromDb): ThreadResponseDto {
    return new ThreadResponseDto({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: thread.user,
    });
  }
  private async findOrFail(id: string): Promise<ThreadFromDb> {
    const thread = await this.threadsRepository.findById(id);
    if (!thread) throw new NotFoundException(`Thread "${id}" tidak ditemukan`);
    return thread;
  }

  private assertOwnership(
    threadUserId: string,
    requestingUser: AuthenticatedUser,
  ): void {
    if (threadUserId !== requestingUser.id) {
      throw new ForbiddenException('Kamu tidak berhak mengubah thread ini');
    }
  }

  async create(
    dto: CreateThreadRequestDto,
    user: AuthenticatedUser,
  ): Promise<ThreadResponseDto> {
    const thread = await this.threadsRepository.create({
      title: dto.title,
      content: dto.content,
      userId: user.id,
    });
    return this.toResponseDto(thread);
  }

  async findAll(): Promise<ThreadResponseDto[]> {
    const threads = await this.threadsRepository.findAll();
    return threads.map((t: ThreadFromDb) => this.toResponseDto(t));
  }

  async findMyThreads(user: AuthenticatedUser): Promise<ThreadResponseDto[]> {
    const threads = await this.threadsRepository.findByUserId(user.id);
    return threads.map((t: ThreadFromDb) => this.toResponseDto(t));
  }

  async findOne(id: string): Promise<ThreadResponseDto> {
    const thread = await this.findOrFail(id);
    return this.toResponseDto(thread);
  }

  async update(
    id: string,
    dto: UpdateThreadRequestDto,
    user: AuthenticatedUser,
  ): Promise<ThreadResponseDto> {
    const thread = await this.findOrFail(id);
    this.assertOwnership(thread.userId, user);

    const updated = await this.threadsRepository.update(id, dto);
    return this.toResponseDto(updated);
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<DeleteThreadResponseDto> {
    const thread = await this.findOrFail(id);
    this.assertOwnership(thread.userId, user);

    await this.threadsRepository.delete(id);

    return new DeleteThreadResponseDto({
      message: `Thread "${thread.title}" berhasil dihapus`,
    });
  }
}