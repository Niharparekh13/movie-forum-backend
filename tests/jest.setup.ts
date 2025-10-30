// BEFORE: import { prisma } from '../src/db/prisma.js';
import { prisma } from '../src/db/prisma';

beforeAll(async () => { /* migrate/seed done via CLI */ });

afterAll(async () => {
  await prisma.$disconnect();
}, 15000);
