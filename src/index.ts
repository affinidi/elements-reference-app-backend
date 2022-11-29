import http from 'http'
import './config'

import { createServer } from './server'
import { logger } from './logger'

const host = process.env.HOST
const port = process.env.PORT

async function startServer() {
  const app = createServer()

  const server = http.createServer(app).listen({ host, port }, () => {
    logger.info('Server ready at', server.address())
  })

  // eslint-disable-next-line no-undef
  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2']
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      logger.info(`process.once ${type}`)

      server.close(() => {
        logger.info('HTTP server closed')
      })
    })
  })
}

startServer()
