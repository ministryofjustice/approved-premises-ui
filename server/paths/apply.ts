import { path } from 'static-path'

const applicationsPath = path('/applications')
const applicationPath = applicationsPath.path(':id')

const pagesPath = applicationPath.path('tasks/:task/pages/:page')
const peoplePath = applicationsPath.path('people')

const paths = {
  applications: {
    new: applicationsPath.path('new'),
    start: applicationsPath.path('start'),
    people: {
      find: peoplePath.path('find'),
      selectOffence: peoplePath.path(':crn').path('select-offence'),
    },
    create: applicationsPath,
    index: applicationsPath,
    show: applicationPath,
    update: applicationPath,
    checkYourAnswers: applicationPath.path('check-your-answers'),
    submission: applicationPath.path('submission'),
    pages: {
      show: pagesPath,
      update: pagesPath,
    },
  },
}

export default paths
