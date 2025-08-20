import {Request, Response} from 'express';
import {AuthRequest} from '../middleware/authMiddleware';
import {logger} from '../config/logger';
import EventService from '../services/eventService';
import {emitEventUpdate} from '../sockets'; // Actualiza si tienes eventos en tiempo real

const eventService = new EventService();

export default class EventController {
  static async createEvent(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      logger.info(`Create event request by user: ${authReq.user?.id}`);
      const event = await eventService.createEvent({
        ...req.body,
        userId: authReq.user?.id,
      });
      logger.info(`Event created for user: ${authReq.user?.id}, eventId: ${event?.id}`);
      res.status(201).json(event);
    } catch (err) {
      logger.error(`Error creating event: ${err}`);
      res.status(400).json({error: 'Error creating event', details: err});
    }
  }

  static async getEventByUser(req: Request, res: Response) {
    try {
      logger.info(`Get events for user: ${req.params.userId}`);
      const events = await eventService.getEventsByUser(req.params.userId);
      res.json(events);
    } catch (err) {
      logger.error(`Error fetching events for user ${req.params.userId}: ${err}`);
      res.status(500).json({error: 'Error fetching events', details: err});
    }
  }

  static async listEvents(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const {year, month, type, userId} = EventController.sanitizeAndValidateQuery(req.query);
      // Only admin/manager can filter by userId other than self
      let filterUserId = authReq.user?.id;
      if ((authReq.user?.role === 'admin' || authReq.user?.role === 'manager') && userId) {
        filterUserId = userId;
        logger.info(`List events request by ${authReq.user?.role} for userId: ${userId}`);
      }
      logger.info(`List events query: year=${year}, month=${month}, type=${type}, userId=${filterUserId}`);
      const events = await eventService.listEvents({
        year,
        month,
        type,
        userId: filterUserId,
      });
      res.json(events);
    } catch (err) {
      logger.error(`Error listing events: ${err}`);
      res.status(400).json({error: 'Error listing events', details: err});
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      logger.info(`Update event request for ID: ${req.params.id}`);
      const eventId = req.params.id;
      const updated = await eventService.updateEvent(eventId, req.body);
      if (!updated) {
        logger.warn(`Event not found for ID: ${eventId}`);
        return res.status(404).json({error: 'Event not found'});
      }
      emitEventUpdate(updated.userId);
      logger.info(`Event updated for user: ${updated.userId}, eventId: ${eventId}`);
      res.json(updated);
    } catch (err) {
      logger.error(`Error updating event: ${err}`);
      res.status(400).json({error: 'Error updating event', details: err});
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      logger.info(`Delete event request for ID: ${req.params.id}`);
      const eventId = req.params.id;
      const deleted = await eventService.deleteEvent(eventId);
      if (!deleted) {
        logger.warn(`Event not found for ID: ${eventId}`);
        return res.status(404).json({error: 'Event not found'});
      }
      emitEventUpdate(deleted.userId);
      logger.info(`Event deleted for user: ${deleted.userId}, eventId: ${eventId}`);
      res.status(204).send();
    } catch (err) {
      logger.error(`Error deleting event: ${err}`);
      res.status(400).json({error: 'Error deleting event', details: err});
    }
  }

  static sanitizeAndValidateQuery(query: any) {
    logger.info(`Sanitizing and validating query: ${JSON.stringify(query)}`);

    const getString = (val: any) => (typeof val === 'string' ? val : undefined);
    let year = getString(query.year);
    let month = getString(query.month);
    let type = getString(query.type);
    const userId = getString(query.userId);

    const allowedTypes = ['office', 'vacation'];
    if (type && !allowedTypes.includes(type)) type = undefined;

    let monthNum: number | undefined = undefined;
    if (month && /^[0-9]+$/.test(month)) {
      const m = parseInt(month, 10);
      if (m >= 1 && m <= 12) monthNum = m - 1; // JS Date: 0-indexed
    }

    let yearNum: number | undefined = undefined;
    if (year && /^[0-9]+$/.test(year)) {
      const y = parseInt(year, 10);
      if (y >= 2000) yearNum = y;
    }

    logger.info(
      `Sanitized and validated query: ${JSON.stringify({
        year: yearNum,
        month: monthNum,
        type,
        userId,
      })}`
    );

    return {year: yearNum, month: monthNum, type, userId};
  }
}
