import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: required('JWT_SECRET', 'devsecret'),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

// Provide default export as well, so `import config from ...` also works.
export default config;
