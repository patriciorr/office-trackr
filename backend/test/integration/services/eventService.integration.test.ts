import {describe, expect, it} from '@jest/globals';
import EventService from '../../../src/services/eventService';
import {ValidationError} from '../../../src/utils/AppError';

describe('EventService (integration)', () => {
  const service = new EventService();

  it('creates a new event when none exists for the user and date', async () => {
    const event: any = await service.createEvent({userId: 'user-1', date: new Date('2024-05-15'), type: 'office'});

    expect(event).toMatchObject({userId: 'user-1', type: 'office'});
    expect(event.id).toBeDefined();
  });

  it('updates the existing event when one already exists for the same user and date', async () => {
    const date = new Date('2024-06-01');
    const first: any = await service.createEvent({userId: 'user-2', date, type: 'office'});

    const second: any = await service.createEvent({userId: 'user-2', date, type: 'vacation'});

    expect(second.id).toBe(first.id);
    expect(second.type).toBe('vacation');
  });

  it('rejects creating an event with missing fields', async () => {
    await expect(service.createEvent({userId: 'user-3'})).rejects.toEqual(
      new ValidationError('Missing required fields')
    );
  });

  it('lists events filtered by year and month', async () => {
    await service.createEvent({userId: 'user-4', date: new Date('2024-03-10'), type: 'office'});
    await service.createEvent({userId: 'user-4', date: new Date('2024-04-10'), type: 'vacation'});

    const events = await service.listEvents({userId: 'user-4', year: 2024, month: 2});

    expect(events).toHaveLength(1);
    expect((events[0] as any).type).toBe('office');
  });

  it('lists events filtered by type', async () => {
    await service.createEvent({userId: 'user-4d', date: new Date('2024-03-10'), type: 'office'});
    await service.createEvent({userId: 'user-4d', date: new Date('2024-04-10'), type: 'vacation'});

    const events = await service.listEvents({userId: 'user-4d', type: 'vacation'});

    expect(events).toHaveLength(1);
    expect((events[0] as any).type).toBe('vacation');
  });

  it('lists events filtered by year only', async () => {
    await service.createEvent({userId: 'user-4b', date: new Date('2024-01-10'), type: 'office'});
    await service.createEvent({userId: 'user-4b', date: new Date('2025-01-10'), type: 'office'});

    const events = await service.listEvents({userId: 'user-4b', year: 2024});

    expect(events).toHaveLength(1);
  });

  it('lists every event when no filters are supplied', async () => {
    await service.createEvent({userId: 'user-4c', date: new Date('2024-01-10'), type: 'office'});

    const events = await service.listEvents({});

    expect(events.length).toBeGreaterThanOrEqual(1);
  });

  it('updates and deletes events through the repository', async () => {
    const created: any = await service.createEvent({userId: 'user-5', date: new Date('2024-07-01'), type: 'office'});

    const updated: any = await service.updateEvent(created.id, {type: 'vacation'});
    expect(updated.type).toBe('vacation');

    const deleted: any = await service.deleteEvent(created.id);
    expect(deleted?.id).toBe(created.id);

    const remaining = await service.listEvents({userId: 'user-5'});
    expect(remaining).toHaveLength(0);
  });
});
