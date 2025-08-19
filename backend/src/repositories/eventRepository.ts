import Event, { IEvent } from "../models/Event";
import { logger } from "../config/logger";

export default class EventRepository {
  async findByUserAndDate(userId: string, date: Date | string) {
    logger.info(
      `EventRepository: findByUserAndDate called for userId: ${userId}, date: ${date}`
    );
    return Event.findOne({ user: userId, date });
  }
  async create(eventData: Partial<IEvent>) {
    logger.info(
      `EventRepository: create called for user: ${eventData.user}, date: ${eventData.date}`
    );
    const event = new Event(eventData);
    return event.save();
  }

  async findByUser(userId: string) {
    logger.info(`EventRepository: findByUser called for userId: ${userId}`);
    return Event.find({ user: userId });
  }

  async findAll() {
    logger.info("EventRepository: findAll called");
    return Event.find();
  }

  async findFiltered(query: any) {
    logger.info(
      `EventRepository: findFiltered called with query: ${JSON.stringify(
        query
      )}`
    );
    return Event.find(query);
  }

  async updateById(id: string, update: Partial<IEvent>) {
    logger.info(`EventRepository: updateById called for id: ${id}`);
    return Event.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string) {
    logger.info(`EventRepository: deleteById called for id: ${id}`);
    return Event.findByIdAndDelete(id);
  }
}
