import {beforeEach, describe, expect, it} from '@jest/globals';
import EventRepository from '../../../src/repositories/eventRepository';
import Event from '../../../src/models/Event';

describe('EventRepository (integration)', () => {
  const repository = new EventRepository();

  const buildEvent = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: `event-${Date.now()}-${Math.random()}`,
    userId: 'user-1',
    date: new Date('2024-05-15'),
    type: 'office' as const,
    ...overrides,
  });

  describe('createEvent', () => {
    it('persists an event and returns its DTO', async () => {
      const data = buildEvent();

      const created = await repository.createEvent(data);

      expect(created).toEqual({id: data.id, userId: data.userId, date: data.date, type: data.type});
      await expect(Event.findOne({id: data.id})).resolves.not.toBeNull();
    });
  });

  describe('findByUserAndDate', () => {
    it('finds an existing event for the user and date', async () => {
      const data = buildEvent();
      await repository.createEvent(data);

      const found = await repository.findByUserAndDate(data.userId, data.date);

      expect(found?.id).toBe(data.id);
    });

    it('returns null when there is no matching event', async () => {
      await expect(repository.findByUserAndDate('user-1', new Date('2030-01-01'))).resolves.toBeNull();
    });
  });

  describe('listEvents', () => {
    beforeEach(async () => {
      await repository.createEvent(buildEvent({id: 'event-1', userId: 'user-1', type: 'office'}));
      await repository.createEvent(
        buildEvent({id: 'event-2', userId: 'user-1', type: 'vacation', date: new Date('2024-06-01')})
      );
      await repository.createEvent(buildEvent({id: 'event-3', userId: 'user-2', type: 'office'}));
    });

    it('lists events matching a query', async () => {
      const events = await repository.listEvents({userId: 'user-1'});

      expect(events.map(e => e.id).sort()).toEqual(['event-1', 'event-2']);
    });

    it('lists events matching a date range', async () => {
      const events = await repository.listEvents({
        userId: 'user-1',
        date: {$gte: new Date('2024-05-01'), $lte: new Date('2024-05-31')},
      });

      expect(events.map(e => e.id)).toEqual(['event-1']);
    });
  });

  describe('updateEventById', () => {
    it('updates an event and returns the refreshed DTO', async () => {
      const data = buildEvent();
      await repository.createEvent(data);

      const updated = await repository.updateEventById(data.id, data.userId, {type: 'vacation'});

      expect(updated?.type).toBe('vacation');
    });

    it('returns null when the event does not exist', async () => {
      await expect(repository.updateEventById('missing-id', 'user-1', {type: 'vacation'})).resolves.toBeNull();
    });
  });

  describe('deleteEventById', () => {
    it('deletes an event by id', async () => {
      const data = buildEvent();
      await repository.createEvent(data);

      const deleted: any = await repository.deleteEventById(data.id, data.userId);

      expect(deleted?.id).toBe(data.id);
      await expect(Event.findOne({id: data.id})).resolves.toBeNull();
    });

    it('returns null when the event does not exist', async () => {
      await expect(repository.deleteEventById('missing-id', 'user-1')).resolves.toBeNull();
    });

    it('does not allow another user to update or delete an event', async () => {
      const data = buildEvent();
      await repository.createEvent(data);
      await expect(repository.updateEventById(data.id, 'other-user', {type: 'vacation'})).resolves.toBeNull();
      await expect(repository.deleteEventById(data.id, 'other-user')).resolves.toBeNull();
      await expect(Event.findOne({id: data.id})).resolves.toMatchObject({type: 'office', userId: data.userId});
    });
  });
});
