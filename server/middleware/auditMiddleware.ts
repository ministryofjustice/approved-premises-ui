import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Key, pathToRegexp } from 'path-to-regexp'
import logger from '../../logger'
import AuditService from '../services/auditService'

export type AuditEventSpec = {
  auditEvent?: string
  auditBodyParams?: Array<string>
  redirectAuditEventSpecs?: Array<RedirectAuditEventSpec>
}

type RedirectAuditEventSpec = { path: string; auditEvent: string }
type RedirectAuditMatcher = { keys: Array<Key>; auditEvent: string; regExp: RegExp }

export const auditMiddleware = (
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
) => {
  if (auditEventSpec) {
    const redirectMatchers: Array<RedirectAuditMatcher> = auditEventSpec.redirectAuditEventSpecs?.map(
      ({ path, auditEvent: redirectAuditEvent }) => {
        const keys: Array<Key> = []
        return { auditEvent: redirectAuditEvent, keys, regExp: pathToRegexp(path, keys) }
      },
    )

    return wrapHandler(
      handler,
      auditService,
      auditEventSpec?.auditEvent,
      auditEventSpec?.auditBodyParams,
      redirectMatchers,
    )
  }
  return handler
}

const wrapHandler =
  (
    handler: RequestHandler,
    auditService: AuditService,
    auditEvent: string | undefined,
    auditBodyParams: Array<string> | undefined,
    redirectMatchers: Array<RedirectAuditMatcher> | undefined,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectAuditEvent: string
    let redirectParams: Record<string, string>
    const username = res?.locals?.user?.name

    if (!username) {
      logger.error('User without a username is attempting to access an audited path')
      res.redirect('/authError')
      return
    }

    await handler(req, res, next)

    const encodedRedirectLocation = res.get('Location')
    if (encodedRedirectLocation && redirectMatchers) {
      const redirectPath = decodeURI(encodedRedirectLocation)
      redirectParams = {}

      redirectMatchers.some(redirectMatcher => {
        if (matchAuditEvent(redirectPath, redirectMatcher, redirectParams)) {
          redirectAuditEvent = redirectMatcher.auditEvent
          return true
        }
        return false
      })
    }

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, username, auditDetails(req, auditBodyParams))
    }

    if (redirectAuditEvent) {
      await auditService.sendAuditMessage(redirectAuditEvent, username, redirectParams)
    }
  }

const auditDetails = (req: Request, auditBodyParams: Array<string> | undefined) => {
  if (!auditBodyParams) {
    return req.params
  }

  return {
    ...req.params,
    ...auditBodyParams.reduce(
      (previous, current) => (req.body[current] ? { [current]: req.body[current], ...previous } : previous),
      {},
    ),
  }
}

const matchAuditEvent = (
  path: string,
  redirectMatcher: RedirectAuditMatcher,
  redirectParams: Record<string, string>,
) => {
  const matches = redirectMatcher.regExp.exec(path)

  if (matches) {
    redirectMatcher.keys.forEach((key, i) => {
      const param = key.name
      redirectParams[param] = decodeURIComponent(matches[i + 1])
    })

    return true
  }
  return false
}
