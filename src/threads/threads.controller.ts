import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { CreateThreadRequestDto } from './dto/request/create-thread.request.dto';
import { UpdateThreadRequestDto } from './dto/request/update-thread.request.dto';
import {
  ThreadResponseDto,
  DeleteThreadResponseDto,
} from './dto/response/thread.response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// `import type` wajib di sini karena:
// - isolatedModules: true → setiap file dikompilasi terpisah
// - emitDecoratorMetadata: true → TypeScript emit metadata untuk decorator
// Kombinasi keduanya mengharuskan type-only import tidak diemit sebagai value
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Threads')
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buat thread baru (auth required)' })
  @ApiBody({ type: CreateThreadRequestDto })
  @ApiResponse({ status: 201, type: ThreadResponseDto })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  create(
    @Body() dto: CreateThreadRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ThreadResponseDto> {
    return this.threadsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua thread (publik)' })
  @ApiResponse({ status: 200, type: [ThreadResponseDto] })
  findAll(): Promise<ThreadResponseDto[]> {
    return this.threadsService.findAll();
  }

  // ⚠️ Harus SEBELUM /:id — kalau tidak, "my-threads" dianggap sebagai :id
  @Get('my-threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ambil thread milik user yang sedang login (auth required)' })
  @ApiResponse({ status: 200, type: [ThreadResponseDto] })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  findMyThreads(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ThreadResponseDto[]> {
    return this.threadsService.findMyThreads(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail thread by ID (publik)' })
  @ApiParam({ name: 'id', description: 'UUID thread' })
  @ApiResponse({ status: 200, type: ThreadResponseDto })
  @ApiResponse({ status: 404, description: 'Thread tidak ditemukan' })
  findOne(@Param('id') id: string): Promise<ThreadResponseDto> {
    return this.threadsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update thread (hanya pemilik)' })
  @ApiParam({ name: 'id', description: 'UUID thread' })
  @ApiBody({ type: UpdateThreadRequestDto })
  @ApiResponse({ status: 200, type: ThreadResponseDto })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik thread' })
  @ApiResponse({ status: 404, description: 'Thread tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateThreadRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ThreadResponseDto> {
    return this.threadsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus thread (hanya pemilik)' })
  @ApiParam({ name: 'id', description: 'UUID thread' })
  @ApiResponse({ status: 200, type: DeleteThreadResponseDto })
  @ApiResponse({ status: 401, description: 'Token tidak valid' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik thread' })
  @ApiResponse({ status: 404, description: 'Thread tidak ditemukan' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DeleteThreadResponseDto> {
    return this.threadsService.remove(id, user);
  }
}