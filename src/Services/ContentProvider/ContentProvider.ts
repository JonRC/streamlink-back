import { Content, Result } from 'Database/Entities'

export type ProviderResult = Pick<Result, 'startedAt' | 'foundAt'> & {
  content: Omit<Content, 'imageWidth' | 'imageHeight'>
}

export type ContentProvider = (
  keyword: string,
  headless?: boolean
) => Promise<ProviderResult[]>
