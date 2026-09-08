import {describe, expect, it} from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app';

describe('AuthController (e2e)', () => {
  const credentials = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: `jane-${Date.now()}@example.com`,
    password: 'VioletCedar9!',
  };

  const registerUser = () => request(app).post('/api/users').send(credentials);

  it('logs in with valid credentials and returns a token and user DTO', async () => {
    await registerUser().expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({email: credentials.email, password: credentials.password});

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      role: 'coworker',
    });
    expect(response.body.user.password).toBeUndefined();
  });

  it('rejects login with an incorrect password', async () => {
    await registerUser().expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({email: credentials.email, password: 'WrongPassword1!'});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({error: 'AUTH002 - Invalid credentials'});
  });

  it('rejects login for an unknown email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({email: 'missing@example.com', password: credentials.password});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({error: 'AUTH001 - User not found'});
  });
});
