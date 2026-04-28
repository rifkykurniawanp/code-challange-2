import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './repositories/auth.repository';
import { RegisterRequestDto } from './dto/request/register.request.dto';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { AuthResponseDto } from './dto/response/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    // Cek duplikasi email / username
    const existing = await this.authRepository.findByEmailOrUsername(
      dto.email,
      dto.username,
    );

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email sudah digunakan'
          : 'Username sudah diambil',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.authRepository.createUser({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    const token = this.signToken(user.id, user.email, user.username);

    return new AuthResponseDto({
      message: 'Registrasi berhasil',
      access_token: token,
      user,
    });
  }

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);

    // Pesan error sengaja dibuat samar — jangan beri tahu field mana yang salah
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Email atau password salah');

    const token = this.signToken(user.id, user.email, user.username);

    const { passwordHash: _, ...safeUser } = user;

    return new AuthResponseDto({
      message: 'Login berhasil',
      access_token: token,
      user: safeUser,
    });
  }

  private signToken(userId: string, email: string, username: string): string {
    return this.jwtService.sign({ sub: userId, email, username });
  }
}