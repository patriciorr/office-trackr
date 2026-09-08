import {describe, expect, it, jest} from '@jest/globals';
import EventController from '../../../src/controllers/eventController';
import EventService from '../../../src/services/eventService';
import {emitEventUpdate} from '../../../src/sockets';

jest.mock('../../../src/services/eventService');
jest.mock('../../../src/sockets', () => ({emitEventUpdate: jest.fn()}));

const response = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('eventController', () => {
  it('sanitizes valid event query values', () => {
    expect(
      EventController.sanitizeAndValidateQuery({year: '2024', month: '05', type: 'office', userId: 'user-1'})
    ).toEqual({
      year: 2024,
      month: 4,
      type: 'office',
      userId: 'user-1',
    });
  });

  it('ignores invalid event query values', () => {
    expect(
      EventController.sanitizeAndValidateQuery({year: '1999', month: '13', type: 'meeting', userId: ['user-1']})
    ).toEqual({
      year: undefined,
      month: undefined,
      type: undefined,
      userId: undefined,
    });
  });

  it('ignores a non-numeric month query value', () => {
    expect(EventController.sanitizeAndValidateQuery({month: 'May'})).toEqual({
      year: undefined,
      month: undefined,
      type: undefined,
      userId: undefined,
    });
  });

  it('creates an event for the authenticated user', async () => {
    const event = {id: 'event-1', userId: 'user-1'};
    (EventService.prototype.createEvent as any).mockResolvedValue(event);
    const res = response();

    await EventController.createEvent({body: {type: 'office'}, user: {id: 'user-1'}} as any, res);

    expect(EventService.prototype.createEvent).toHaveBeenCalledWith({type: 'office', userId: 'user-1'});
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(event);
  });

  it('returns 400 when event creation fails', async () => {
    (EventService.prototype.createEvent as any).mockRejectedValue(new Error('invalid event'));
    const res = response();

    await EventController.createEvent({body: {}, user: {id: 'user-1'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Error creating event'}));
  });

  it('uses the requested user when a manager lists events', async () => {
    (EventService.prototype.listEvents as any).mockResolvedValue([]);
    const res = response();

    await EventController.listEvents(
      {query: {year: '2024', month: '1', userId: 'user-2'}, user: {id: 'manager-1', role: 'manager'}} as any,
      res
    );

    expect(EventService.prototype.listEvents).toHaveBeenCalledWith({
      year: 2024,
      month: 0,
      type: undefined,
      userId: 'user-2',
    });
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('uses the authenticated user when a coworker lists events', async () => {
    (EventService.prototype.listEvents as any).mockResolvedValue([]);
    const res = response();

    await EventController.listEvents({query: {userId: 'user-2'}, user: {id: 'user-1', role: 'coworker'}} as any, res);

    expect(EventService.prototype.listEvents).toHaveBeenCalledWith({
      year: undefined,
      month: undefined,
      type: undefined,
      userId: 'user-1',
    });
  });

  it('returns 400 when listing events fails', async () => {
    (EventService.prototype.listEvents as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await EventController.listEvents({query: {}, user: {id: 'user-1', role: 'coworker'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Error listing events'}));
  });

  it('returns 404 when an event update finds no event', async () => {
    (EventService.prototype.updateEvent as any).mockResolvedValue(null);
    const res = response();

    await EventController.updateEvent({params: {id: 'missing'}, body: {type: 'office'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: 'Event not found'});
  });

  it('updates an event and emits a user update', async () => {
    const event = {id: 'event-1', userId: 'user-1', type: 'office'};
    (EventService.prototype.updateEvent as any).mockResolvedValue(event);
    const res = response();

    await EventController.updateEvent({params: {id: 'event-1'}, body: {type: 'office'}} as any, res);

    expect(emitEventUpdate).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalledWith(event);
  });

  it('returns 400 when updating an event fails', async () => {
    (EventService.prototype.updateEvent as any).mockRejectedValue(new Error('invalid event'));
    const res = response();

    await EventController.updateEvent({params: {id: 'event-1'}, body: {}} as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Error updating event'}));
  });

  it('deletes an event with a 204 response', async () => {
    (EventService.prototype.deleteEvent as any).mockResolvedValue({id: 'event-1', userId: 'user-1'});
    const res = response();

    await EventController.deleteEvent({params: {id: 'event-1'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('returns 404 when deleting a missing event', async () => {
    (EventService.prototype.deleteEvent as any).mockResolvedValue(null);
    const res = response();

    await EventController.deleteEvent({params: {id: 'missing'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({error: 'Event not found'});
  });

  it('returns 400 when deleting an event fails', async () => {
    (EventService.prototype.deleteEvent as any).mockRejectedValue(new Error('database unavailable'));
    const res = response();

    await EventController.deleteEvent({params: {id: 'event-1'}} as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Error deleting event'}));
  });
});
