import { config } from 'dotenv'
import puppeteer, { ElementHandle, Page } from 'puppeteer'
import { stringify } from 'query-string'
import { v4 } from 'uuid'

import { Content } from 'Database/Entities/Content'
import {
  cluster,
  InitCluster,
  runContentProvider
} from 'Services/PuppeteerCluster/Cluster'
import { CookiesStorage } from 'Util'
import { DateUtil } from 'Util/Date'

import { ContentProvider, ProviderResult } from './ContentProvider'
config()

export const netflixProvider: ContentProvider = async ({
  data: { keyword },
  page
}) => {
  const startedAt = new Date()

  const query = stringify({
    q: keyword
  })

  const cookies = await CookiesStorage.load('netflix')

  await page.setCookie(...cookies)

  await page.goto(`https://www.netflix.com/search?${query}`)

  await page
    .waitForSelector('.search', {
      timeout: 5000
    })
    .catch(async () => {
      await login(page)
      await page.goto(`https://www.netflix.com/search?${query}`)
      await page.waitForSelector('.search')
    })

  const validSearch = await page
    .waitForSelector('.title-card-container')
    .catch(() => false)
  if (!validSearch) return []

  const containers = await page.$$('div.title-card-container')

  const contents = await Promise.all(containers.map(getContent(startedAt)))

  return contents
}

const login = async (page: Page) => {
  const login = process.env.NETFLIX_USERNAME as string
  const password = process.env.NETFLIX_PASSWORD as string

  /**
   * Id and password
   */
  await page.goto('https://www.netflix.com/login')
  await page.waitForSelector('#id_userLoginId')
  await page.type('#id_userLoginId', login)
  await page.type('#id_password', password)
  await page.click('button[type=submit]')

  /**
   * Choose profile
   */
  await page.waitForSelector('.profile-link')
  await page.click('.profile-link')

  /**
   * Persist cache
   */
  const cookies = await page.cookies()
  CookiesStorage.save('netflix', cookies)
}

const getContent =
  (startedAt: Date) => async (container: ElementHandle<HTMLDivElement>) => {
    const title =
      (await container.$eval(
        'p.fallback-text',
        element => element?.textContent
      )) || ''

    const imageUrl = await container.$eval(
      'img',
      element => (element as HTMLImageElement)?.src
    )

    const holeUrl = await container.$eval(
      'img',
      element => (element as HTMLImageElement).closest('a')?.href
    )

    const alternativeQuery = stringify({
      q: title
    })

    const alternativeUrl = `https://www.netflix.com/search?${alternativeQuery}`

    const url = holeUrl?.split('?')[0] || alternativeUrl

    const [, contentId] = url.match(/watch\/(\d+)/) || ([] as undefined[])

    const foundAt = new Date()

    const providerResult: ProviderResult = {
      content: {
        id: contentId || `invalid-${v4()}`,
        imageUrl,
        provider: 'netflix',
        title,
        url
      },
      foundAt,
      startedAt
    }

    return providerResult
  }
