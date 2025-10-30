import { z } from 'zod';
export const RegisterDto = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(12)
});
export const LoginDto = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
