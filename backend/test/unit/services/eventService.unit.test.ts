import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {randomUUID} from 'crypto';
import EventService from '../../../src/services/eventService';
import EventRepository from '../../../src/repositories/eventRepository';
import {ValidationError} from '../../../src/utils/AppError';
import {IEvent} from '../../../src/models/Event';

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto') as typeof import('crypto');
  return {...actual, randomUUID: jest.fn()};
});
jest.mock('../../../src/repositories/eventRepository');

describe('eventService', () => {
  const repository = EventRepository as any;
  const service = new EventService();
  const eventData: Partial<IEvent> = {userId: 'user-1', date: new Date('2024-05-15'), type: 'office'};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('rejects events with missing required fields', async () => {
      await expect(service.createEvent({userId: 'user-1'})).rejects.toEqual(
        new ValidationError('Missing required fields')
      );
      expect(repository.prototype.findByUserAndDate).not.toHaveBeenCalled();
    });

    it('updates an existing event for the same user and date', async () => {
      const existing = {id: 'event-1'};
      (repository.prototype.findByUserAndDate as any).mockResolvedValue(existing);
      (repository.prototype.updateEventById as any).mockResolvedValue({...existing, type: 'vacation'});

      await expect(service.createEvent({...eventData, type: 'vacation'})).resolves.toEqual({
        id: 'event-1',
        type: 'vacation',
      });
      expect(repository.prototype.updateEventById).toHaveBeenCalledWith('event-1', {type: 'vacation'});
      expect(repository.prototype.createEvent).not.toHaveBeenCalled();
    });

    it('assigns an id and creates a new event when none exists', async () => {
      (repository.prototype.findByUserAndDate as any).mockResolvedValue(null);
      (randomUUID as any).mockReturnValue('event-1');
      (repository.prototype.createEvent as any).mockResolvedValue({id: 'event-1', ...eventData});

      await expect(service.createEvent({...eventData})).resolves.toEqual({id: 'event-1', ...eventData});
      expect(repository.prototype.createEvent).toHaveBeenCalledWith({...eventData, id: 'event-1'});
    });
  });

  it('builds a date and type query when listing events', async () => {
    (repository.prototype.listEvents as any).mockResolvedValue([]);

    await service.listEvents({year: 2024, month: 4, type: 'office', userId: 'user-1'});

    expect(repository.prototype.listEvents).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'office',
      date: {
        $gte: new Date(2024, 4, 1),
        $lte: new Date(2024, 5, 0, 23, 59, 59, 999),
      },
    });
  });

  it('builds a year-only date query when no month is supplied', async () => {
    (repository.prototype.listEvents as any).mockResolvedValue([]);

    await service.listEvents({year: 2024});

    expect(repository.prototype.listEvents).toHaveBeenCalledWith({
      date: {
        $gte: new Date(2024, 0, 1),
        $lte: new Date(2024, 11, 31, 23, 59, 59, 999),
      },
    });
  });

  it('lists events without a date filter when no date is supplied', async () => {
    (repository.prototype.listEvents as any).mockResolvedValue([]);

    await service.listEvents({});

    expect(repository.prototype.listEvents).toHaveBeenCalledWith({});
  });

  it('delegates event updates and deletions', async () => {
    const update = {type: 'vacation' as const};
    (repository.prototype.updateEventById as any).mockResolvedValue({id: 'event-1'});
    (repository.prototype.deleteEventById as any).mockResolvedValue({id: 'event-1'});

    await expect(service.updateEvent('event-1', update)).resolves.toEqual({id: 'event-1'});
    await expect(service.deleteEvent('event-1')).resolves.toEqual({id: 'event-1'});
    expect(repository.prototype.updateEventById).toHaveBeenCalledWith('event-1', update);
    expect(repository.prototype.deleteEventById).toHaveBeenCalledWith('event-1');
  });
});
