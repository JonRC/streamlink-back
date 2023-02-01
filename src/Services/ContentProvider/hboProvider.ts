import { ElementHandle } from 'puppeteer'

import { CookiesStorage } from 'Util'

import { ContentProvider, ProviderResult } from './ContentProvider'

export const hboProvider: ContentProvider = async ({
  data: { keyword },
  page
}) => {
  const startedAt = new Date()

  const cookies = await CookiesStorage.load('hbo')
  await page.setCookie(...cookies)

  await page.goto('https://play.hbomax.com/search')

  await page.waitForSelector('div[aria-label=Accept]')

  await page.click('div[aria-label=Accept]')

  await page.waitForSelector('input[type=text]')

  await page.type('input[type=text]', keyword)

  await page
    .waitForSelector('a[href*=urn][aria-label]', { timeout: 10000 })
    .catch(() => null)

  const newCookies = await page.cookies()
  CookiesStorage.save('hbo', newCookies)

  const containers = await page.$$('a[href*=type][aria-label]')

  const contents = await Promise.all(
    containers.slice(0, 1).map(getContent(startedAt))
  )

  return contents
}

const getContent =
  (startedAt: Date) => async (container: ElementHandle<HTMLAnchorElement>) => {
    const title = (await container.evaluate(anchor => anchor?.ariaLabel)) || ''
    const urlPath = await container.evaluate(anchor => anchor?.href)

    const url = `https://play.hbomax.com/${urlPath}`

    const [, contentId] = urlPath.match(/page:(\w+)/) || []

    const imageUrl = `https://art-gallery-latam.api.hbo.com/images/${contentId}/tileburnedin?size=360x203&compression=low&protection=false&scaleDownToFit=false&productCode=hboMax&overlayImage=urn:warnermedia:brand:not-in-a-hub&language=pt-br`

    const result: ProviderResult = {
      content: {
        id: contentId,
        imageUrl,
        provider: 'hbo',
        title,
        url
      },
      foundAt: new Date(),
      startedAt
    }

    return result
  }
