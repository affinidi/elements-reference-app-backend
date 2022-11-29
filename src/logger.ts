import { createLogger, transports, format } from 'winston'

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.simple(),
    }),
  ],
})
