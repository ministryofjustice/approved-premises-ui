import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { ApplicationService, PersonService } from '../../../services'
import applicationFactory from '../../../testutils/factories/application'
import documentFactory from '../../../testutils/factories/document'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import AttachDocuments from './attachDocuments'

jest.mock('../../../services/applicationService.ts')

describe('attachDocuments', () => {
  const application = applicationFactory.build()
  const documents = documentFactory.buildList(3)

  describe('initialize', () => {
    const getDocumentsMock = jest.fn().mockResolvedValue(documents)
    let applicationService: DeepMocked<ApplicationService>
    const personService = createMock<PersonService>({})

    beforeEach(() => {
      applicationService = createMock<ApplicationService>({
        getDocuments: getDocumentsMock,
      })
    })

    it('calls the getDocuments method on the client with a token and the application', async () => {
      await AttachDocuments.initialize({}, application, 'some-token', { personService, applicationService })

      expect(getDocumentsMock).toHaveBeenCalledWith('some-token', application)
    })

    it('assigns the selected documents', async () => {
      const page = await AttachDocuments.initialize(
        { documentIds: [documents[0].id, documents[1].id] },
        application,
        'SOME_TOKEN',
        { applicationService, personService },
      )

      expect(page.body).toEqual({ selectedDocuments: [documents[0], documents[1]] })
      expect(page.documents).toEqual(documents)
    })

    it('assigns the selected documents if the selection is not an array', async () => {
      const page = await AttachDocuments.initialize({ documentIds: documents[0].id }, application, 'SOME_TOKEN', {
        applicationService,
        personService,
      })

      expect(page.body).toEqual({ selectedDocuments: [documents[0]] })
    })
  })

  itShouldHaveNextValue(new AttachDocuments({}), '')

  itShouldHavePreviousValue(new AttachDocuments({}), '')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new AttachDocuments({})
      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return a record with the document filename as the key and the description as the value', () => {
      const selectedDocuments = [
        documentFactory.build({ fileName: 'file1.pdf', description: 'Description goes here' }),
        documentFactory.build({ fileName: 'file2.pdf', description: null }),
      ]

      const page = new AttachDocuments({ selectedDocuments })

      expect(page.response()).toEqual({ 'file1.pdf': 'Description goes here', 'file2.pdf': 'No description' })
    })
  })
})
