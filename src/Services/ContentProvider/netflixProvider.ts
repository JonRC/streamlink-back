import { config } from 'dotenv'
import puppeteer, { ElementHandle, Page } from 'puppeteer'
import { stringify } from 'query-string'

import { Content } from 'Database/Entities/Content'
import { CookiesStorage } from 'Util'
import { DateUtil } from 'Util/Date'

import { ContentProvider, ProviderResult } from './ContentProvider'
config()

export const netflixProvider: ContentProvider = async (keyword, headless) => {
  const startedAt = new Date()

  const browser = await puppeteer.launch({ headless })

  const page = await browser.newPage()

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

  const containers = await page.$$<HTMLDivElement>('.title-card-container')

  const contents = await Promise.all(containers.map(getContent(startedAt)))

  await browser.close()

  return contents
}

const login = async (page: Page) => {
  const login = process.env.NETFLIX_USERNAME
  const password = process.env.NETFLIX_PASSWORD

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

    const foundAt = new Date()

    const providerResult: ProviderResult = {
      content: {
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
