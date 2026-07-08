// ============================================================
// DAGDAG PUHUNAN — Authentication Tests
// Run: cd server && npm test
// ============================================================
import request from 'supertest';
import app     from '../server/index.js';

const VALID_USER = { email: 'maria@lgusanpedro.ph', password: 'Admin@2026' };

describe('POST /api/auth/login', () => {
  it('returns 200 and token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(VALID_USER);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('lgu_admin');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'WrongPassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'unknown@test.com', password: 'password' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'test' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('email');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send(VALID_USER);
    token = res.body.token;
  });

  it('returns user profile for valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(VALID_USER.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
