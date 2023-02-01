import stringSimilarity from 'string-similarity'
import { v4 } from 'uuid'

import { Provider, Result, Search } from 'Database/Entities'
import { ImageSize } from 'Services'
import { ProviderResult } from 'Services/ContentProvider'
import * as PuppeteerCluster from 'Services/PuppeteerCluster'
import { DateUtil } from 'Util/Date'

export const doSearch = async (keyword: string): Promise<Search> => {
  const startedAt = new Date()
  const searchId = v4()

  const providerProcesses = providers.map(provider =>
    PuppeteerCluster.runContentProvider({ keyword: 'terror', provider })
  )

  const providerResults = await Promise.all(providerProcesses).then(results =>
    results.flat()
  )

  const results = await Promise.all(
    providerResults.map(providerResult =>
      fromProviderResultToResult({
        keyword,
        providerResult,
        searchId
      })
    )
  )

  const finishedAt = new Date()

  const search: Search = {
    duration: DateUtil.diff(finishedAt, startedAt),
    startedAt,
    finishedAt,
    keyword,
    results,
    id: searchId
  }

  return search
}

const providers: Provider[] = ['prime', 'disney', 'globoplay', 'hbo', 'netflix']

const fromProviderResultToResult = async (input: {
  providerResult: ProviderResult
  searchId: string
  keyword: string
}): Promise<Result> => {
  const { keyword, providerResult, searchId } = input

  const imageDimension = await ImageSize.fromUrl(
    providerResult.content.imageUrl
  )

  const result: Result = {
    content: {
      ...providerResult.content,
      imageHeight: imageDimension.height,
      imageWidth: imageDimension.width
    },
    foundAt: providerResult.foundAt,
    startedAt: providerResult.startedAt,
    contentId: providerResult.content.id,
    duration: DateUtil.diff(providerResult.foundAt, providerResult.startedAt),
    searchId,
    matchRate: stringSimilarity.compareTwoStrings(
      keyword,
      providerResult.content.title
    )
  }

  return result
}
