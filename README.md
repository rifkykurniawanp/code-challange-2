# Forum API

Simple Q&A Forum REST API — **NestJS 11** · **Prisma 7** · **PostgreSQL**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT (`@nestjs/jwt` + `passport-jwt`) |
| Validation | `class-validator` + `class-transformer` |
| Docs | Swagger UI (`@nestjs/swagger`) |

---

## Arsitektur

Setiap request mengalir satu arah:

```
Controller  →  Service  →  Repository  →  PrismaService  →  PostgreSQL
```

| Layer | Tanggung Jawab |
|---|---|
| **Controller** | Terima HTTP request, delegate ke Service, kembalikan response |
| **Service** | Business logic, validasi kepemilikan, mapping ke ResponseDto |
| **Repository** | Semua query Prisma — Service tidak pernah sentuh Prisma langsung |
| **PrismaService** | Koneksi ke PostgreSQL via adapter |

### Konvensi DTO

```
dto/
├── request/    → input dari client, berisi decorator @IsString, @IsEmail, dll
└── response/   → output ke client, berisi shape yang aman (tanpa passwordHash)
```

Mapping dari Prisma result → ResponseDto dilakukan di **Service**, bukan di Controller.

---

## Folder Structure

```
code-challange-2/
│
├── prisma/
│   ├── schema.prisma               # Definisi model User & Thread
│   ├── seed.ts                     # Dummy data (johndoe, janedoe + 3 threads)
│   └── migrations/                 # Auto-generated oleh prisma migrate
│
├── src/
│   │
│   ├── generated/
│   │   └── prisma/                 # Auto-generated oleh prisma generate
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts       # PrismaClient wrapper, connect/disconnect lifecycle
│   │   └── prisma.module.ts        # @Global() — tersedia di seluruh app tanpa re-import
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts   # @CurrentUser() — ambil user dari JWT
│   │   └── filters/
│   │       └── http-exception.filter.ts    # Normalisasi semua error response
│   │
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   ├── register.request.dto.ts  # username, email, password (dengan validasi)
│   │   │   │   └── login.request.dto.ts     # email, password
│   │   │   └── response/
│   │   │       └── auth.response.dto.ts     # message, access_token, user
│   │   ├── repositories/
│   │   │   └── auth.repository.ts   # findByEmail, findByEmailOrUsername, createUser
│   │   ├── auth.controller.ts       # POST /auth/register, POST /auth/login
│   │   ├── auth.service.ts          # bcrypt hash/compare, sign JWT, return AuthResponseDto
│   │   ├── auth.module.ts           # Wiring: JwtModule, PassportModule, AuthRepository
│   │   ├── jwt.strategy.ts          # Verifikasi Bearer token, isi request.user
│   │   └── jwt-auth.guard.ts        # @UseGuards(JwtAuthGuard) — proteksi route
│   │
│   ├── users/
│   │   ├── dto/
│   │   │   └── response/
│   │   │       └── user.response.dto.ts  # id, username, email, createdAt, threadCount
│   │   ├── repositories/
│   │   │   └── users.repository.ts  # findById (tanpa passwordHash)
│   │   ├── users.controller.ts      # GET /users/:id
│   │   ├── users.service.ts         # findById, throw 404, return UserResponseDto
│   │   └── users.module.ts
│   │
│   ├── threads/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   ├── create-thread.request.dto.ts  # title, content
│   │   │   │   └── update-thread.request.dto.ts  # title?, content? (opsional)
│   │   │   └── response/
│   │   │       └── thread.response.dto.ts  # id, title, content, author, timestamps
│   │   ├── repositories/
│   │   │   └── threads.repository.ts  # create, findAll, findByUserId, findById, update, delete
│   │   ├── threads.controller.ts    # 6 endpoints thread
│   │   ├── threads.service.ts       # CRUD + ownership check (assertOwnership)
│   │   └── threads.module.ts
│   │
│   ├── app.module.ts                # Root module, import semua modul
│   └── main.ts                      # Bootstrap, ValidationPipe, Swagger setup
│
├── prisma.config.ts                 # Konfigurasi Prisma 7 (datasource URL)
├── .env                             # Environment variables (tidak di-commit)
├── .env.example                     # Template .env untuk tim
├── .gitignore
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Setup & Running

### 1. Clone & install

```bash
git clone <your-repo-url>
cd forum-api
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/forum_db?schema=public"
JWT_SECRET="ganti-dengan-string-random-yang-panjang"
JWT_EXPIRES_IN="7d"
```

### 3. Setup database

```bash
# Buat database forum_db di PostgreSQL terlebih dahulu, lalu:
npx prisma migrate dev --name init

# Generate Prisma Client ke src/generated/prisma/
npx prisma generate
```

### 4. Seed dummy data (opsional)

```bash
npm run prisma:seed
```

Hasil seed:

| Username | Email | Password |
|---|---|---|
| johndoe | johndoe@example.com | password123 |
| janedoe | jane@example.com | password123 |

### 5. Jalankan server

```bash
# Development (hot reload)
npm run start:dev

# Production
npm run build && npm run start:prod
```

### 6. Buka Swagger UI

```
http://localhost:3000/api/docs
```

---

## API Endpoints

### Auth — tidak butuh token

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Daftar user baru, password di-hash bcrypt |
| POST | `/api/auth/login` | Login, return JWT token |

### Users — tidak butuh token

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/users/:id` | Lihat profil publik user |

### Threads

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/threads` | ✅ | Buat thread baru |
| GET | `/api/threads` | ❌ | List semua thread |
| GET | `/api/threads/my-threads` | ✅ | Thread milik user yang login |
| GET | `/api/threads/:id` | ❌ | Detail thread by ID |
| PUT | `/api/threads/:id` | ✅ owner | Update thread |
| DELETE | `/api/threads/:id` | ✅ owner | Hapus thread |

### Cara pakai token

Tambahkan header berikut di setiap request yang memerlukan auth:

```
Authorization: Bearer <access_token>
```

Token didapat dari response `/api/auth/login` atau `/api/auth/register`.

---

## Error Response Format

Semua error mengikuti format yang konsisten:

```json
{
  "statusCode": 403,
  "message": "Kamu tidak berhak mengubah thread ini",
  "path": "/api/threads/some-uuid",
  "timestamp": "2026-04-28T10:00:00.000Z"
}
```

| Status Code | Kondisi |
|---|---|
| 400 | Validasi gagal (field kosong, format email salah, dll) |
| 401 | Token tidak ada atau tidak valid |
| 403 | Token valid tapi bukan pemilik resource |
| 404 | Resource tidak ditemukan |
| 409 | Konflik data (email / username sudah dipakai) |

---

## Prisma Scripts

```bash
npm run prisma:generate   # Generate ulang Prisma Client
npm run prisma:migrate    # Buat & jalankan migration baru
npm run prisma:studio     # Buka GUI Prisma Studio di browser
npm run prisma:seed       # Isi database dengan dummy data
```