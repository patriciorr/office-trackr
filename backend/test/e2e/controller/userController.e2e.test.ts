import {describe, expect, it} from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app';

describe('UserController (e2e)', () => {
  const buildUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: `john-${Date.now()}-${Math.random()}@example.com`,
    password: 'VioletCedar9!',
    ...overrides,
  });

  const createUser = (overrides: Partial<Record<string, unknown>> = {}) =>
    request(app).post('/api/users').send(buildUser(overrides));

  const login = (email: string, password: string) => request(app).post('/api/auth/login').send({email, password});

  describe('POST /api/users', () => {
    it('creates a user and returns its DTO without the password', async () => {
      const data = buildUser();

      const response = await createUser(data);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({email: data.email, firstName: data.firstName, lastName: data.lastName});
      expect(response.body.password).toBeUndefined();
    });

    it('rejects a duplicate email with a validation error', async () => {
      const data = buildUser();
      await createUser(data).expect(201);

      const response = await createUser(data);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: 'EM003 - Email is already registered'});
    });
  });

  describe('GET /api/users', () => {
    it('rejects listing users without authentication', async () => {
      await request(app).get('/api/users').expect(401);
    });

    it('rejects listing users for a coworker role', async () => {
      const data = buildUser();
      await createUser(data).expect(201);
      const {body} = await login(data.email, data.password);

      await request(app).get('/api/users').set('Authorization', `Bearer ${body.token}`).expect(403);
    });

    it('lists users for an admin, applying query filters', async () => {
      const admin = buildUser({role: 'admin'});
      await createUser(admin).expect(201);
      const {body: adminAuth} = await login(admin.email, admin.password);

      const target = buildUser();
      const createdTarget = await createUser(target).expect(201);

      const response = await request(app)
        .get('/api/users')
        .query({emails: target.email})
        .set('Authorization', `Bearer ${adminAuth.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([expect.objectContaining({id: createdTarget.body.id})]);
    });

    it('lists users for a manager role', async () => {
      const manager = buildUser({role: 'manager'});
      await createUser(manager).expect(201);
      const {body} = await login(manager.email, manager.password);

      await request(app).get('/api/users').set('Authorization', `Bearer ${body.token}`).expect(200);
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns the requested user when authenticated', async () => {
      const data = buildUser();
      const created = await createUser(data).expect(201);
      const {body} = await login(data.email, data.password);

      const response = await request(app)
        .get(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(data.email);
    });

    it('returns 404 for an unknown user id', async () => {
      const data = buildUser();
      await createUser(data).expect(201);
      const {body} = await login(data.email, data.password);

      await request(app)
        .get('/api/users/missing-id')
        .set('Authorization', `Bearer ${body.token}`)
        .expect(404, {error: 'User not found'});
    });

    it('rejects the request without a valid token', async () => {
      await request(app).get('/api/users/some-id').expect(401);
      await request(app).get('/api/users/some-id').set('Authorization', 'Bearer not-a-token').expect(403);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('allows a user to update their own profile', async () => {
      const data = buildUser();
      const created = await createUser(data).expect(201);
      const {body} = await login(data.email, data.password);

      const response = await request(app)
        .patch(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${body.token}`)
        .send({firstName: 'Updated'});

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
    });

    it('forbids a user from updating another user', async () => {
      const owner = buildUser();
      const created = await createUser(owner).expect(201);

      const other = buildUser();
      await createUser(other).expect(201);
      const {body: otherAuth} = await login(other.email, other.password);

      await request(app)
        .patch(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${otherAuth.token}`)
        .send({firstName: 'Hacked'})
        .expect(403, {error: 'Forbidden'});
    });

    it('rejects an invalid update with a validation error', async () => {
      const data = buildUser();
      const created = await createUser(data).expect(201);
      const {body} = await login(data.email, data.password);

      await request(app)
        .patch(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${body.token}`)
        .send({firstName: 'Invalid123'})
        .expect(400, {error: 'FN003 - First name can only contain letters'});
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('forbids a non-admin from deleting a user', async () => {
      const data = buildUser();
      const created = await createUser(data).expect(201);
      const {body} = await login(data.email, data.password);

      await request(app)
        .delete(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${body.token}`)
        .expect(403);
    });

    it('allows an admin to delete a user', async () => {
      const admin = buildUser({role: 'admin'});
      await createUser(admin).expect(201);
      const {body: adminAuth} = await login(admin.email, admin.password);

      const target = buildUser();
      const created = await createUser(target).expect(201);

      await request(app)
        .delete(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAuth.token}`)
        .expect(204);

      await request(app)
        .get(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${adminAuth.token}`)
        .expect(404);
    });
  });
});
