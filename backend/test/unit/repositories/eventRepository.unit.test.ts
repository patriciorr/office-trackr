import EventRepository from '../../../src/repositories/eventRepository';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import Event, {IEvent} from '../../../src/models/Event';

jest.mock('../../../src/models/Event');

describe('eventRepository', () => {
  const eventModel = Event as any;
  const repository = new EventRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserAndDate', () => {
    it('finds an event by user and date', async () => {
      const date = new Date('2024-01-01');
      const event: Partial<IEvent> = {id: '1', userId: 'user-1', date, type: 'office'};
      eventModel.findOne.mockResolvedValue(event);

      await expect(repository.findByUserAndDate('user-1', date)).resolves.toBe(event);
      expect(eventModel.findOne).toHaveBeenCalledWith({userId: 'user-1', date});
    });
  });

  describe('createEvent', () => {
    it('creates an event and returns its DTO', async () => {
      const data: Partial<IEvent> = {userId: 'user-1', date: new Date('2024-01-01'), type: 'office'};
      const savedEvent = {id: '1', ...data, ignored: true};
      eventModel.mockImplementation(() => ({save: jest.fn<() => Promise<any>>().mockResolvedValue(savedEvent)}));

      await expect(repository.createEvent(data)).resolves.toEqual({id: '1', ...data});
      expect(eventModel).toHaveBeenCalledWith(data);
    });
  });

  describe('listEvents', () => {
    it('lists events and transforms them to DTO', async () => {
      const query = {userId: 'user-1'};
      const events: Partial<IEvent>[] = [{id: '1', userId: 'user-1', date: new Date('2024-01-01'), type: 'office'}];
      eventModel.find.mockResolvedValue(events);

      await expect(repository.listEvents(query)).resolves.toEqual([{...events[0], extra: undefined}]);
      expect(eventModel.find).toHaveBeenCalledWith(query);
    });
  });

  describe('updateEventById', () => {
    it('updates and returns the DTO', async () => {
      const update: Partial<IEvent> = {type: 'vacation'};
      const event: Partial<IEvent> = {id: '1', userId: 'user-1', date: new Date('2024-01-01'), type: 'vacation'};
      eventModel.findOneAndUpdate.mockResolvedValue(event);

      await expect(repository.updateEventById('1', update)).resolves.toEqual(event);
      expect(eventModel.findOneAndUpdate).toHaveBeenCalledWith({id: '1'}, update, {new: true});
    });

    it('returns null when no event is found', async () => {
      eventModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(repository.updateEventById('missing', {})).resolves.toBeNull();
    });
  });

  describe('deleteEventById', () => {
    it('deletes an event by id', async () => {
      const event: Partial<IEvent> = {id: '1'};
      eventModel.findOneAndDelete.mockResolvedValue(event);

      await expect(repository.deleteEventById('1')).resolves.toBe(event);
      expect(eventModel.findOneAndDelete).toHaveBeenCalledWith({id: '1'});
    });
  });
});
