import puppeteer, { ElementHandle } from 'puppeteer'
import { stringify } from 'querystring'

import { ContentProvider, ProviderResult } from './ContentProvider'

export const globoplaySearch: ContentProvider = async (keyword, headless) => {
  const startedAt = new Date()

  const browser = await puppeteer.launch({ headless })

  const page = await browser.newPage()

  const query = stringify({ q: keyword })

  await page.goto(`https://globoplay.globo.com/busca/?${query}`)
  await Promise.race([
    page.waitForSelector('.playkit-slider__item', { timeout: 10000 }),
    page.waitForSelector('.search-results-widget__no-results')
  ])

  const results = await page.$$<Element>('.playkit-slider__item')

  const contents = await Promise.all(results.map(getContent(startedAt)))

  await browser.close()

  return contents
}

const getContent =
  (startedAt: Date) => async (result: ElementHandle<HTMLDivElement>) => {
    const imageUrl = await result.$eval(
      'img',
      (img: unknown) => (img as HTMLImageElement).src
    )

    const url = await result.$eval(
      'a',
      (a: unknown) => (a as HTMLAnchorElement).href
    )
    const title = await result.$eval(
      'a',
      (a: unknown) => (a as HTMLAnchorElement).title
    )

    const foundAt = new Date()

    const providerResult: ProviderResult = {
      content: {
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

globoplaySearch('porta', false).then(console.log)
