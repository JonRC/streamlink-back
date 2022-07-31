import { findBestMatch } from 'string-similarity'

import { Content } from 'Database/Entities/Content'
import { Search } from 'Database/Entities/Search'
import { ContentProvider } from 'Services'
import {
  disneySearch,
  globoplaySearch,
  hboSearch,
  netflixSearch,
  primeSearch
} from 'Services/ContentProvider'
import { DateUtil } from 'Util/Date'

export const doSearch = async (keyword: string): Promise<Search> => {}

const contentProviders: ContentProvider = [
  disneySearch,
  globoplaySearch,
  hboSearch,
  netflixSearch,
  primeSearch,
  s
]
