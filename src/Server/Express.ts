/* eslint simple-import-sort/imports: "off" */

import express from 'express'
import 'express-async-errors'
import cors from 'cors'

export const app = express()

export const serverSetup = () => {
  const port = process.env.PORT || 3003

  app.use(cors())

  app.use(express.json())

  app.listen(port, () => console.log(`Server on port ${port}`))

  return app
}
