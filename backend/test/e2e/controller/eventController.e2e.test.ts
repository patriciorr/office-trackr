import {describe, expect, it} from '@jest/globals';
import request from 'supertest';
import {createServer} from 'http';
import type {AddressInfo} from 'net';
import {io as ioClient, type Socket} from 'socket.io-client';
import app from '../../../src/app';
import {initSocket} from '../../../src/sockets';

describe('EventController (e2e)', () => {
  const buildUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: `event-user-${Date.now()}-${Math.random()}@example.com`,
    password: 'VioletCedar9!',
    ...overrides,
  });

  const createUser = (overrides: Partial<Record<string, unknown>> = {}) =>
    request(app).post('/api/users').send(buildUser(overrides));

  const login = (email: string, password: string) => request(app).post('/api/auth/login').send({email, password});

  const registerAndLogin = async (overrides: Partial<Record<string, unknown>> = {}) => {
    const data = buildUser(overrides);
    await createUser(data).expect(201);
    const {body} = await login(data.email, data.password);
    return body.token as string;
  };

  describe('POST /api/events', () => {
    it('rejects the request without authentication', async () => {
      await request(app).post('/api/events').send({date: '2024-05-15', type: 'office'}).expect(401);
    });

    it('creates an event for the authenticated user', async () => {
      const token = await registerAndLogin();

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({date: '2024-05-15', type: 'office'});

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({type: 'office'});
      expect(response.body.id).toBeDefined();
    });

    it('ignores a client-supplied userId and uses the authenticated user instead', async () => {
      const token = await registerAndLogin();

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({date: '2024-05-16', type: 'office', userId: 'someone-else'});

      expect(response.status).toBe(201);
      expect(response.body.userId).not.toBe('someone-else');
    });
  });

  describe('GET /api/events', () => {
    it('only returns events for the authenticated coworker', async () => {
      const ownerToken = await registerAndLogin();
      const otherToken = await registerAndLogin();

      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({date: '2024-05-15', type: 'office'})
        .expect(201);
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({date: '2024-05-15', type: 'vacation'})
        .expect(201);

      const response = await request(app).get('/api/events').set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].type).toBe('office');
    });

    it('lets a manager filter events by another userId', async () => {
      const managerToken = await registerAndLogin({role: 'manager'});
      const memberData = buildUser();
      const memberCreated = await createUser(memberData).expect(201);
      const {body: memberAuth} = await login(memberData.email, memberData.password);

      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${memberAuth.token}`)
        .send({date: '2024-05-15', type: 'office'})
        .expect(201);

      const response = await request(app)
        .get('/api/events')
        .query({userId: memberCreated.body.id})
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('updates an existing event', async () => {
      const token = await registerAndLogin();
      const created = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({date: '2024-05-15', type: 'office'})
        .expect(201);

      const response = await request(app)
        .put(`/api/events/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'vacation'});

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('vacation');
    });

    it('returns 404 for an unknown event id', async () => {
      const token = await registerAndLogin();

      await request(app)
        .put('/api/events/missing-id')
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'vacation'})
        .expect(404, {error: 'Event not found'});
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('deletes an existing event', async () => {
      const token = await registerAndLogin();
      const created = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({date: '2024-05-15', type: 'office'})
        .expect(201);

      await request(app).delete(`/api/events/${created.body.id}`).set('Authorization', `Bearer ${token}`).expect(204);

      await request(app)
        .put(`/api/events/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'vacation'})
        .expect(404);
    });

    it('returns 404 for an unknown event id', async () => {
      const token = await registerAndLogin();

      await request(app)
        .delete('/api/events/missing-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404, {error: 'Event not found'});
    });
  });

  describe('real-time updates', () => {
    it('emits a socket.io event when an event is updated', async () => {
      const token = await registerAndLogin();
      const created = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({date: '2024-05-15', type: 'office'})
        .expect(201);

      const httpServer = createServer(app);
      initSocket(httpServer);
      await new Promise<void>(resolve => httpServer.listen(0, resolve));
      const port = (httpServer.address() as AddressInfo).port;

      const client: Socket = ioClient(`http://127.0.0.1:${port}`, {transports: ['websocket']});
      try {
        await new Promise<void>((resolve, reject) => {
          client.once('connect', () => resolve());
          client.once('connect_error', reject);
        });

        const eventReceived = new Promise<void>(resolve => {
          client.once(`event-update-${created.body.userId}`, () => resolve());
        });

        await request(app)
          .put(`/api/events/${created.body.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({type: 'vacation'})
          .expect(200);

        await eventReceived;
      } finally {
        client.close();
        await new Promise<void>(resolve => httpServer.close(() => resolve()));
      }
    }, 10000);
  });
});
