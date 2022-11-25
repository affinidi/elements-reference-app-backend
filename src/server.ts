import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { setProxy } from './proxy'

const createServer = (): express.Application => {
  const app = express()

  app.use(
    cors({
      credentials: true,
      origin: process.env.FRONTEND_HOST,
    }),
  )

  app.use(bodyParser.json())

  app.disable('x-powered-by')

  setProxy(app)

  app.get('/health', (_req, res) => {
    res.send({
      status: 'Ok',
      name: 'elements-reference-app-backend',
      version: process.env.npm_package_version,
    })
  })

  return app
}

export { createServer }
