import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format((info) => {
      if (process.env.NODE_ENV === "production") {
        if (typeof info.message === "string") {
          info.message = info.message
            .replace(/[\w.-]+@[\w.-]+/g, "[email]")
            .replace(/[a-f\d]{24}/gi, "[userId]");
        }
      }
      return info;
    })(),
    format.json()
  ),
  defaultMeta: { service: "calendar-backend" },
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}
