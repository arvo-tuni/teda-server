import winston from 'winston';

const logger = winston.createLogger( {
  level: 'verbose',
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
