import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'development' ? colorize() : format.uncolorize(),
    logFormat
  ),
  transports: [
    // Write all logs to console
    new transports.Console({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      level: 'info'
    }),
    
    // Write all logs with level 'error' and below to error.log
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error'
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(__dirname, '../../logs/exceptions.log') })
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(__dirname, '../../logs/rejections.log') })
  ]
});