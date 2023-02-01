import crypto from 'crypto'

import axios from 'axios'
import { config } from 'dotenv'
import puppeteer, { Page } from 'puppeteer'

import { CookiesStorage, LocalStorage } from 'Util'

import { ContentProvider, ProviderResult } from './ContentProvider'
import { DisneySearch } from './DisneySearch'
config()

type Auth = { context: { token: string } }

export const disneyProvider: ContentProvider = (...input) =>
  doDisneySearch(...input).catch(error => {
    onError(error)
    return []
  })

const doDisneySearch: ContentProvider = async ({ data, page }) => {
  const { keyword } = data
  const startedAt = new Date()

  const cookies = await CookiesStorage.load('disney')
  await page.setCookie(...cookies)
  await LocalStorage.load('disney', page)

  const authJson = await getAuthJson(page)
  await page.close()
  const auth = JSON.parse(authJson) as Auth

  const { token } = auth.context

  const url = `https://disney.content.edge.bamgrid.com/svc/search/disney/version/5.1/region/BR/audience/k-false,l-false/maturity/1450/language/pt-BR/queryType/ge/pageSize/30/query/${keyword}`

  const { data: body } = await axios.get<DisneySearch>(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const { hits } = body.data.search

  const results = hits.map<ProviderResult>(hit => {
    const videoId = hit?.hit?.family?.encodedFamilyId
    const randomString = crypto.randomBytes(2).toString('hex')
    const imageUrl = imageUrlFromImageTitleObj(hit?.hit?.image?.tile['1.78'])
    const title = titleFromTextTitleObj(hit?.hit?.text?.title)
    const foundAt = new Date()
    const contentUrl = `https://www.disneyplus.com/pt-br/movies/${randomString}/${videoId}`

    const providerResult: ProviderResult = {
      content: {
        id: videoId,
        imageUrl,
        provider: 'disney',
        title,
        url: contentUrl
      },
      foundAt,
      startedAt
    }

    return providerResult
  })

  return results
}

const getAuthJson = async (page: Page) => {
  await page.goto('https://www.disneyplus.com/select-profile')
  await page
    .waitForSelector('.profile-avatar-appear-done', { timeout: 8000 })
    .catch(async () => {
      await login(page)
    })

  const authJson = await tokenFromLocalStorage(page)

  return authJson
}

const tokenFromLocalStorage = async (page: Page): Promise<string> => {
  const tokenJson = await page.evaluate(() => {
    const tokenKey = Object.keys(localStorage).find(key =>
      key.match('access--disney')
    )
    if (!tokenKey) throw new Error('Disney: Could not find token')

    const tokenJson = localStorage.getItem(tokenKey)
    if (!tokenJson) throw new Error('Disney: Could not find token')

    return tokenJson
  })

  return tokenJson
}

const login = async (page: Page) => {
  const login = process.env.DISNEY_USERNAME
  const password = process.env.DISNEY_PASSWORD

  await page.goto('https://www.disneyplus.com/login')

  await page.waitForSelector('#email')
  await page.type('#email', login)
  await page.click('button[value=submit]')

  await page.waitForSelector('#password')
  await page.type('#password', password)
  await page.click('button[value=submit]')

  await page.waitForSelector('.profile-avatar-appear-done')

  const cookies = await page.cookies()
  CookiesStorage.save('disney', cookies)
  await LocalStorage.save('disney', page)
}

const imageUrlFromImageTitleObj = (obj: Record<string, any>): string => {
  for (const key in obj) {
    if (key === 'url') return obj[key]
    if (typeof obj[key] === 'object') return imageUrlFromImageTitleObj(obj[key])
  }
  throw new Error('Disney: Could not find image url')
}

const titleFromTextTitleObj = (obj: Record<string, any>): string => {
  for (const key in obj) {
    if (key === 'content') return obj[key]
    if (typeof obj[key] === 'object') return titleFromTextTitleObj(obj[key])
  }
  throw new Error('Disney: Could not find title')
}

const onError = async (error: unknown) => {
  console.error(error)
  await CookiesStorage.clear('disney')
  await LocalStorage.clear('disney')
}
