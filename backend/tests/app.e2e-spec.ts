import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 👉 simulate login and get JWT
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@globex.com', password: 'password' }) // adjust to your seed data
      .expect(201);

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET) with valid token returns tenant users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('email');
    expect(res.body[0]).toHaveProperty('tenant');
  });

  it('/users (GET) without token is forbidden', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .expect(401);
  });
});
