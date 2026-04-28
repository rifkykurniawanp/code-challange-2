
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config'

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.thread.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create users
  const john = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'johndoe@example.com',
      passwordHash,
    },
  });

  const jane = await prisma.user.create({
    data: {
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash,
    },
  });

  // Create threads
  await prisma.thread.createMany({
    data: [
      {
        userId: john.id,
        title: 'How do I set up environment variables in Node.js?',
        content:
          'I am new to backend development and confused about how to hide my API keys. Could someone explain how to use dotenv?',
      },
      {
        userId: jane.id,
        title: 'When should I use PostgreSQL vs MongoDB?',
        content:
          'For a medium-scale e-commerce project, which database is more recommended and why?',
      },
      {
        userId: john.id,
        title: 'Getting a CORS error when hitting the API from React',
        content:
          "I keep getting an 'Access-Control-Allow-Origin' error. How do I handle this on the Express.js side?",
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   Users created: johndoe, janedoe');
  console.log('   Password for both: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });