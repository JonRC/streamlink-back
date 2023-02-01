import puppeteer, { ElementHandle } from 'puppeteer'

import { ContentProvider, ProviderResult } from './ContentProvider'

export const primeProvider: ContentProvider = async ({
  data: { keyword },
  page
}) => {
  const startedAt = new Date()

  await page.goto(`https://www.primevideo.com/search/?phrase=${keyword}`)

  const containers = await page.$$('div.av-hover-wrapper')

  const contents = await Promise.all(containers.map(getPicture(startedAt)))

  return contents
}

const getPicture =
  (startedAt: Date) => async (container: ElementHandle<HTMLDivElement>) => {
    const imageElement = await container.$('img')
    const srcProperty = await imageElement?.getProperty('src')
    const imageUrl = (await srcProperty?.jsonValue()) || ''

    const description =
      (await container.$eval('p', element => element.textContent)) || undefined

    const title =
      (await container.$eval('span > a', element => element.textContent)) || ''

    const url = await container.$eval(
      'a',
      element => (element as HTMLAnchorElement).href
    )

    const foundAt = new Date()

    const providerResult: ProviderResult = {
      content: {
        id: '',
        imageUrl,
        provider: 'prime',
        title,
        url,
        description
      },
      foundAt,
      startedAt
    }

    return providerResult
  }
