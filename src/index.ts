import express from 'express'
import proxy from 'express-http-proxy'
import http from 'http'
import cors from 'cors'
import { AddressInfo } from 'net'

import { config } from 'dotenv'

config()

const apiKey = process.env.API_KEY
const projectDid = process.env.PROJECT_DID
const projectId = process.env.PROJECT_ID
const host = process.env.HOST
const port = process.env.PORT

const createServer = (): express.Application => {
  const app = express()

  app.use(cors())

  app.use(
    '/cloud-wallet',
    proxy('https://cloud-wallet-api.prod.affinity-project.org', {
      proxyReqOptDecorator(proxyReqOpts) {
        return {
          proxyReqOpts,
          headers: {
            'Api-Key': apiKey,
          },
        }
      },
    }),
  )

  app.use(
    '/affinity-verifier',
    proxy('https://affinity-verifier.prod.affinity-project.org', {
      proxyReqOptDecorator(proxyReqOpts) {
        return {
          proxyReqOpts,
          headers: {
            'Api-Key': apiKey,
          },
        }
      },
    }),
  )

  app.use(
    '/user-management',
    proxy('https://console-user-management.apse1.affinidi.com', {
      proxyReqOptDecorator(proxyReqOpts) {
        return {
          proxyReqOpts,
          headers: {
            'Api-Key': apiKey,
          },
        }
      },
    }),
  )

  app.use(
    '/console-vc-issuance',
    proxy('https://console-vc-issuance.apse1.affinidi.com', {
      proxyReqOptDecorator(proxyReqOpts) {
        return {
          proxyReqOpts,
          headers: {
            'Api-Key': apiKey,
          },
        }
      },
      proxyReqBodyDecorator(bodyContent, srcReq) {
        if (srcReq.method !== 'POST' || srcReq.url !== '/api/v1/issuances') {
          return bodyContent
        }

        try {
          const body = JSON.parse(bodyContent.toString())

          body.template.issuerDid = projectDid
          body.projectId = projectId

          const result = JSON.stringify(body)
          return Buffer.from(result, 'utf-8')
        } catch (error) {
          console.log(error)
        }

        return bodyContent
      },
    }),
  )

  app.disable('x-powered-by')

  app.get('/health', (_req, res) => {
    res.send('UP')
  })

  return app
}

export { createServer }

async function startServer() {
  const app = createServer()

  const server = http.createServer(app).listen({ host, port }, () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const addressInfo = server.address() as AddressInfo
    console.log(`Server ready at http://${addressInfo.address}:${addressInfo.port}`)
  })

  // eslint-disable-next-line no-undef
  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2']
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      console.log(`process.once ${type}`)

      server.close(() => {
        console.log('HTTP server closed')
      })
    })
  })
}

startServer()
