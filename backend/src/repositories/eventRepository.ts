import Event, {IEvent} from '../models/Event';
import {logger} from '../config/logger';

export default class EventRepository {
  async findByUserAndDate(userId: string, date: Date | string) {
    logger.info(`EventRepository: findByUserAndDate called for userId: ${userId}, date: ${date}`);
    return Event.findOne({userId: userId, date});
  }
  async createEvent(eventData: Partial<IEvent>) {
    logger.info(`EventRepository: createEvent called for user: ${eventData.userId}, date: ${eventData.date}`);
    const event = new Event(eventData);
    const savedEvent = await event.save();
    return this.toEventDTO(savedEvent);
  }

  // TODO: Enable if needed
  // async findByUser(userId: string) {
  //   logger.info(`EventRepository: findByUser called for userId: ${userId}`);
  //   const events = await Event.find({userId: userId});
  //   return events.map(this.toEventDTO);
  // }

  // TODO: Enable if needed
  // async findAll() {
  //   logger.info('EventRepository: findAll called');
  //   const events = await Event.find();
  //   return events.map(this.toEventDTO);
  // }

  async listEvents(query: any) {
    logger.info(`EventRepository: listEvents called with query: ${JSON.stringify(query)}`);
    const events = await Event.find(query);
    return events.map(this.toEventDTO);
  }

  async updateEventById(id: string, update: Partial<IEvent>) {
    logger.info(`EventRepository: updateEventById called for id: ${id}`);
    const updatedEvent = await Event.findOneAndUpdate({id}, update, {
      new: true,
    });
    return updatedEvent ? this.toEventDTO(updatedEvent) : null;
  }

  async deleteEventById(id: string) {
    logger.info(`EventRepository: deleteEventById called for id: ${id}`);
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
