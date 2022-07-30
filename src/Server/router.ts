import * as SearchController from 'Domain/Search/Controller'
import { Router } from 'express'

const router = Router()

router.post('/search', SearchController.doSearchController)

export { router as MainRouter }
