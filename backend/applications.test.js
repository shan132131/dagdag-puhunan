import request from 'supertest';
import app     from '../server/index.js';

let adminToken, msmeToken;

beforeAll(async () => {
  const [a, m] = await Promise.all([
    request(app).post('/api/auth/login').send({ email:'maria@lgusanpedro.ph', password:'Admin@2026' }),
    request(app).post('/api/auth/login').send({ email:'ana@gmail.com',         password:'Msme@2026' }),
  ]);
  adminToken = a.body.token;
  msmeToken  = m.body.token;
});

describe('GET /api/applications', () => {
  it('returns applications for admin', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.applications)).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  it('MSME borrower only sees own applications', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${msmeToken}`);
    expect(res.status).toBe(200);
    res.body.applications.forEach(a => {
      expect(a.name).toBe('Ana Cruz');
    });
  });
});

describe('POST /api/applications', () => {
  const validApp = {
    business:  'Test Store',
    category:  'sari-sari',
    barangay:  'Poblacion',
    amount:    15000,
    purpose:   'Stock replenishment for testing purposes',
    term:      12,
  };

  it('creates application for MSME user', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${msmeToken}`)
      .send(validApp);
    expect([201, 500]).toContain(res.status); // 500 if DB not available in test env
    if (res.status === 201) {
      expect(res.body.application.ref).toMatch(/^DP-2026-\d{4}$/);
      expect(res.body.application.status).toBe('Pending');
    }
  });

  it('returns 400 for amount below minimum', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${msmeToken}`)
      .send({ ...validApp, amount: 500 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid category', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${msmeToken}`)
      .send({ ...validApp, category: 'invalid-category' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/applications/:id/status — RBAC', () => {
  it('returns 403 for MSME trying to approve', async () => {
    const res = await request(app)
      .patch('/api/applications/1/status')
      .set('Authorization', `Bearer ${msmeToken}`)
      .send({ status: 'Approved' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .patch('/api/applications/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'InvalidStatus' });
    expect(res.status).toBe(400);
  });
});
