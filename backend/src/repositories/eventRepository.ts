import Event, {IEvent} from '../models/Event';
import {logger} from '../config/logger';

export default class EventRepository {
  async findByUserAndDate(userId: string, date: Date | string) {
    logger.info(`EventRepository: findByUserAndDate called for userId: ${userId}, date: ${date}`);
    return Event.findOne({userId: userId, date});
  }
  async create(eventData: Partial<IEvent>) {
    logger.info(`EventRepository: create called for user: ${eventData.userId}, date: ${eventData.date}`);
    const event = new Event(eventData);
    const savedEvent = await event.save();
    return this.toEventDTO(savedEvent);
  }

  async findByUser(userId: string) {
    logger.info(`EventRepository: findByUser called for userId: ${userId}`);
    const events = await Event.find({userId: userId});
    return events.map(this.toEventDTO);
  }

  async findAll() {
    logger.info('EventRepository: findAll called');
    const events = await Event.find();
    return events.map(this.toEventDTO);
  }

  async findFiltered(query: any) {
    logger.info(`EventRepository: findFiltered called with query: ${JSON.stringify(query)}`);
    const events = await Event.find(query);
    return events.map(this.toEventDTO);
  }

  async updateById(id: string, update: Partial<IEvent>) {
    logger.info(`EventRepository: updateById called for id: ${id}`);
    const updatedEvent = await Event.findOneAndUpdate({id}, update, {
      new: true,
    });
    return updatedEvent ? this.toEventDTO(updatedEvent) : null;
  }

  async deleteById(id: string) {
    logger.info(`EventRepository: deleteById called for id: ${id}`);
    return Event.findOneAndDelete({id});
  }

  private toEventDTO(event: IEvent) {
    return {
      id: event.id,
      userId: event.userId,
      date: event.date,
      type: event.type,
    };
  }
}
