import proxy from 'express-http-proxy'
import {
  AFFINITY_VERIFIER,
  CLOUD_WALLET_API,
  CONSOLE_USER_MANAGEMENT,
  CONSOLE_VC_ISSUANCE,
} from './hosts'
import { logger } from './logger'

const apiKeyHash = process.env.API_KEY_HASH
const issuerDid = process.env.ISSUER_DID
const projectId = process.env.PROJECT_ID

const proxyReqOptDecorator = (proxyReqOpts) => {
  return {
    ...proxyReqOpts,
    headers: {
      ...proxyReqOpts.headers,
      'Api-Key': apiKeyHash,
    },
  }
}

export const setProxy = (app) => {
  app.use(
    '/cloud-wallet',
    proxy(CLOUD_WALLET_API, {
      proxyReqOptDecorator,
    }),
  )

  app.use(
    '/affinity-verifier',
    proxy(AFFINITY_VERIFIER, {
      proxyReqOptDecorator,
    }),
  )

  app.use(
    '/user-management',
    proxy(CONSOLE_USER_MANAGEMENT, {
      proxyReqOptDecorator,
    }),
  )

  app.use(
    '/console-vc-issuance',
    proxy(CONSOLE_VC_ISSUANCE, {
      proxyReqOptDecorator,
      proxyReqBodyDecorator(body, srcReq) {
        if (srcReq.method !== 'POST' || srcReq.url !== '/api/v1/issuances') {
          return body
        }

        try {
          return {
            ...body,
            template: {
              ...body.template,
              issuerDid,
            },
            projectId,
          }
        } catch (error) {
          logger.error(error)
        }

        return body
      },
    }),
  )
}
