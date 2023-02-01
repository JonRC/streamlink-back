import { Cluster as PuppeteerCluster } from 'puppeteer-cluster'
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster'

import { Content } from 'Database/Entities'
import {
  ContentProvider,
  globoplayProvider,
  hboProvider,
  netflixProvider,
  primeProvider,
  ProviderResult
} from 'Services/ContentProvider'
import { disneyProvider } from 'Services/ContentProvider/disneyProvider'

type TaskInput = {
  keyword: string
  provider: Content['provider']
}

export let cluster: PuppeteerCluster<TaskInput, ProviderResult[]>

export const InitCluster = async () => {
  const clusterInstance: PuppeteerCluster<TaskInput, ProviderResult[]> =
    await PuppeteerCluster.launch({
      concurrency: PuppeteerCluster.CONCURRENCY_BROWSER,
      maxConcurrency: 2,
      puppeteerOptions: {
        headless: false
      }
    })

  cluster = clusterInstance
}

export const runContentProvider = (input: TaskInput) =>
  cluster.execute(input, ({ page }) => {
    const provider = providerDictionary[input.provider]

    return provider({ page, data: { keyword: input.keyword } })
  })

const providerDictionary: Record<Content['provider'], ContentProvider> = {
  disney: disneyProvider,
  globoplay: globoplayProvider,
  hbo: hboProvider,
  netflix: netflixProvider,
  prime: primeProvider
}
