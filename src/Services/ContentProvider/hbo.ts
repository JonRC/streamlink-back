import puppeteer, { ElementHandle } from 'puppeteer'
import { Content } from 'Database/Entities/Content'
import { CookiesStorage } from 'Util'
import { DateUtil } from 'Util/Date'

export const hboSearch = async (
  keyword: string
): Promise<Omit<Content, 'rating'>[]> => {
  const startedAt = new Date()

  const browser = await puppeteer.launch({
    headless: true
  })

  const page = await browser.newPage()

  const cookies = await CookiesStorage.load('hbo')
  await page.setCookie(...cookies)

  await page.goto('https://play.hbomax.com/search')

  await page.waitForSelector('#textInput1210')

  await page.type('#textInput1210', keyword)

  await page
    .waitForSelector('a[href*=urn][aria-label]', { timeout: 10000 })
    .catch(() => null)

  const newCookies = await page.cookies()
  CookiesStorage.save('hbo', newCookies)

  const containers = await page.$$<HTMLAnchorElement>(
    'a[href*=urn][aria-label]'
  )

  const contents = await Promise.all(containers.map(getContent(startedAt)))

  await browser.close()

  return contents
}

const getContent =
  (startedAt: Date) =>
  async (
    container: ElementHandle<HTMLAnchorElement>
  ): Promise<Omit<Content, 'rating'>> => {
    const title = await container.evaluate(anchor => anchor?.ariaLabel)
    const urlPath = await container.evaluate(anchor => anchor?.href)

    const url = `https://play.hbomax.com/${urlPath}`

    const [, contentId] = urlPath.match(/page:(\w+)/) || []

    const imageUrl = `https://art-gallery-latam.api.hbo.com/images/${contentId}/tileburnedin?size=360x203&compression=low&protection=false&scaleDownToFit=false&productCode=hboMax&overlayImage=urn:warnermedia:brand:not-in-a-hub&language=pt-br`

    const foundAt = new Date()

    return {
      image: {
        url: imageUrl,
        height: 203,
        width: 360
      },
      provider: 'hbo',
      title,
      url,
      foundAt,
      startedAt,
      duration: DateUtil.diff(foundAt, startedAt)
    }
  }
