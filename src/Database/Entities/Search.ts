import { Result } from './Result'

export type Search = {
  keyword: string
  results: Result[]
  startedAt: Date
  finishedAt: Date
  duration: number
}
