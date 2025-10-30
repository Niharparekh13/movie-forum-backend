import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/clients';
import { config } from '../config/env';
import { RegisterDto, LoginDto } from '../validators/auth.dto';
import { error, ok } from '../utils/response';

export async function register(req: Request, res: Response) {
  const parse = RegisterDto.safeParse(req.body);
  if (!parse.success) return res.status(422).json(error('VALIDATION_ERROR','Invalid input', parse.error.issues));
  const { username, email, password } = parse.data;
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) return res.status(409).json(error('CONFLICT', 'Email or username already exists'));
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, email, passwordHash } });
  return res.status(201).json(ok({ id: user.id, username: user.username, email: user.email }));
}

export async function login(req: Request, res: Response) {
  const parse = LoginDto.safeParse(req.body);
  if (!parse.success) return res.status(422).json(error('VALIDATION_ERROR','Invalid input', parse.error.issues));
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json(error('UNAUTHORIZED', 'Invalid credentials'));
  const okPass = await bcrypt.compare(password, user.passwordHash);
  if (!okPass) return res.status(401).json(error('UNAUTHORIZED', 'Invalid credentials'));
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '30m' });
  return res.json(ok({ token }));
}

export async function me(req: Request, res: Response) {
  const userId = (req as any).user?.id as number | undefined;
  if (!userId) return res.status(401).json(error('UNAUTHORIZED', 'Missing user'));
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, email: true, role: true } });
  return res.json(ok(user));
}
