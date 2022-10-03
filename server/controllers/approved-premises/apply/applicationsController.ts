import type { Request, Response, RequestHandler, NextFunction } from 'express'
import createError from 'http-errors'

import ApplicationService from '../../../services/approved-premises/applicationService'
import { PersonService } from '../../../services/approved-premises'
import { fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/approved-premises/apply'
import { DateFormats } from '../../../utils/dateUtils'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService, private readonly personService: PersonService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applicationSummaries = await this.applicationService.tableRows(req.user.token)

      res.render('applications/list', { pageHeading: 'Approved Premises applications', applicationSummaries })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    }
  }

  show(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const application = req.session?.application?.[req.params.id]

      if (!application) {
        next(createError(404, 'Not found'))
      }

      res.render('applications/show', { application, id: req.params.id })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const person = await this.personService.findByCrn(req.user.token, crnArr[0])

        return res.render(`applications/confirm`, {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render('applications/new', {
        pageHeading: "Enter the individual's CRN",
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.createApplication(req.user.token, req.body.crn)

      res.redirect(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' }),
      )
    }
  }
}
