import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiGateWayModule } from '../src/api-gateway.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';

describe('Api-gateway (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGateWayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `e2e-${Date.now()}@example.com`,
    password: 'test1234',
    name: 'E2E Tester',
  };

  describe('Login Endpoints', () => {
    it('/api/auth/register (POST) - 회원가입 성공', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('statusCode', 201);
      expect(res.body).toHaveProperty('message');
    });

    it('/api/auth/register (POST) - 회원가입 실패 (중복 이메일)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
    });
  });

  it('/api/auth/login (POST) - 로그인 성공', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body).toHaveProperty('statusCode', 200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
  });

  it('/api/auth/login (POST) - 로그인 실패 (잘못된 비밀번호)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(400);

    expect(res.body).toHaveProperty('statusCode', 400);
    expect(res.body).toHaveProperty('message');
  });
});
