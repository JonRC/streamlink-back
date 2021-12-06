import puppeteer, { ElementHandle } from "puppeteer";
import { stringify } from "querystring";
import { Content } from "../entities/Content";

export const globoplaySearch = async (keyWord: string): Promise<Content[]> => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  const query = stringify({
    q: keyWord,
  });

  await page.goto(`https://globoplay.globo.com/busca/?${query}`);
  await Promise.race([
    page.waitForSelector(".playkit-slider__item", { timeout: 10000 }),
    page.waitForSelector(".search-results-widget__no-results"),
  ]);

  const results = await page.$$<HTMLDivElement>(".playkit-slider__item");

  await browser.close();

  return await Promise.all(results.map(getContent));
};

const getContent = async (
  result: ElementHandle<HTMLDivElement>
): Promise<Content> => {
  const image = await result.$eval("img", (img: HTMLImageElement) => img.src);
  const url = await result.$eval("a", (a: HTMLAnchorElement) => a.href);
  const title = await result.$eval("a", (a: HTMLAnchorElement) => a.title);

  return {
    pictures: [image],
    provider: "globoplay",
    title,
    url,
  };
};
