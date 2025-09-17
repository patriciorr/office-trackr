import EventRepository from '../repositories/eventRepository';
import {IEvent} from '../models/Event';
import {logger} from '../config/logger';
import {ValidationError} from '../utils/AppError';
import {randomUUID} from 'crypto';

export default class EventService {
  private eventRepository = new EventRepository();

  async createEvent(eventData: Partial<IEvent>) {
    const {userId, date, type} = eventData;
    logger.info(`EventService: createEvent called for user: ${userId}, date: ${date}, type: ${type}`);
    if (!userId || !date || !type) throw new ValidationError('Missing required fields');
    const existing: IEvent | null = await this.eventRepository.findByUserAndDate(userId, date);
    if (existing) {
      logger.info(`EventService: updating existing event for user: ${userId}, date: ${date}`);
      return this.eventRepository.updateEventById(existing.id, {
        type,
      });
    }

    eventData.id = randomUUID();
    logger.info(`EventService: creating new event for user: ${userId}, date: ${date}, id: ${eventData.id}`);
    return this.eventRepository.createEvent(eventData);
  }

  // TODO: Enable if needed
  // async getEventsByUser(userId: string) {
  //   logger.info(`EventService: getEventsByUser called for userId: ${userId}`);
  //   return this.eventRepository.findByUser(userId);
  // }

  // TODO: Enable if needed
  // async getAllEvents() {
  //   logger.info('EventService: getAllEvents called');
  //   return this.eventRepository.findAll();
  // }

  async updateEvent(id: string, update: Partial<IEvent>) {
    logger.info(`EventService: updateEvent called for id: ${id}`);
    return this.eventRepository.updateEventById(id, update);
  }

  async deleteEvent(id: string) {
    logger.info(`EventService: deleteEvent called for id: ${id}`);
    return this.eventRepository.deleteEventById(id);
  }

  async listEvents(filters: {year?: number; month?: number; type?: string; userId?: string}) {
    logger.info(`EventService: listEvents called with filters: ${JSON.stringify(filters)}`);
    const query: any = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.type) query.type = filters.type;
    if (typeof filters.year === 'number' && typeof filters.month === 'number') {
      const start = new Date(filters.year, filters.month, 1);
      const end = new Date(filters.year, filters.month + 1, 0, 23, 59, 59, 999);
      query.date = {$gte: start, $lte: end};
    } else if (typeof filters.year === 'number') {
      const start = new Date(filters.year, 0, 1);
      const end = new Date(filters.year, 11, 31, 23, 59, 59, 999);
      query.date = {$gte: start, $lte: end};
    }
    return this.eventRepository.listEvents(query);
  }
}
