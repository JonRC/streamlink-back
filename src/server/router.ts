import { Router } from 'express'
import { SearchController } from '../modules/Search'

const router = Router()

router.post('/search', SearchController.doSearchController)

export { router as MainRouter }
