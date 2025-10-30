// tests/helpers.ts
import request from 'supertest';
import app from '../src/app';

export async function loginAs(email: string, password: string) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${res.text}`);
  }
  return res.body.data.token as string;
}

export function authGet(path: string, token: string) {
  return request(app).get(path).set('Authorization', `Bearer ${token}`);
}

export function authPost(path: string, token: string, body: any) {
  return request(app).post(path).set('Authorization', `Bearer ${token}`).send(body);
}

export function authPut(path: string, token: string, body: any) {
  return request(app).put(path).set('Authorization', `Bearer ${token}`).send(body);
}

export function authDel(path: string, token: string) {
  return request(app).delete(path).set('Authorization', `Bearer ${token}`);
}
