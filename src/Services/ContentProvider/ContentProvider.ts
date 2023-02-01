import { Page } from 'puppeteer'

import { Content, Result } from 'Database/Entities'

export type ProviderResult = Pick<Result, 'startedAt' | 'foundAt'> & {
  content: Omit<Content, 'imageWidth' | 'imageHeight'>
}

export type ContentProvider = (input: {
  page: Page
  data: { keyword: string }
}) => Promise<ProviderResult[]>
