import { ElementHandle } from 'puppeteer'
import { stringify } from 'querystring'
import { v4 } from 'uuid'

import { ContentProvider, ProviderResult } from './ContentProvider'

export const globoplayProvider: ContentProvider = async ({
  data: { keyword },
  page
}) => {
  const startedAt = new Date()

  const query = stringify({ q: keyword })

  await page.goto(`https://globoplay.globo.com/busca/?${query}`)
  await Promise.race([
    page.waitForSelector('.playkit-slider__item', { timeout: 10000 }),
    page.waitForSelector('.search-results-widget__no-results')
  ])

  const results = await page.$$('div.playkit-slider__item')

  const contents = await Promise.all(results.map(getContent(startedAt)))

  return contents
}

const getContent =
  (startedAt: Date) => async (result: ElementHandle<HTMLDivElement>) => {
    const imageUrl = await result.$eval('img', img => img.src)

    const url = await result.$eval('a', a => a.href)
    const title = await result.$eval('a', a => a.title)

    const foundAt = new Date()

    const contentIdRegex = new RegExp(
      '\\/' + // match the last but one slash
        '([\\w-]+)' + // match the content id
        '\\/$' // match the last slash
    )
    const [, contentId] = url.match(contentIdRegex) || []

    const providerResult: ProviderResult = {
      content: {
        id: contentId || `invalid-${v4()}`,
        imageUrl,
        provider: 'globoplay',
        title,
        url
      },
      foundAt,
      startedAt
    }

    return providerResult
  }
