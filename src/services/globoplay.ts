import puppeteer, { ElementHandle } from "puppeteer";
import { stringify } from "querystring";
import { Content } from "../entities/Content";

export const globoplaySearch = async (
  keyWord: string
): Promise<Omit<Content, "rating">[]> => {
  const browser = await puppeteer.launch({
    headless: true,
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

  const contents = await Promise.all(results.map(getContent));

  await browser.close();

  return contents;
};

const getContent = async (
  result: ElementHandle<HTMLDivElement>
): Promise<Omit<Content, "rating">> => {
  const image = await result.$eval("img", (img: HTMLImageElement) => img.src);
  const url = await result.$eval("a", (a: HTMLAnchorElement) => a.href);
  const title = await result.$eval("a", (a: HTMLAnchorElement) => a.title);

  return {
    pictures: [image],
    provider: "globoplay",
    title,
    url,
    foundAt: new Date(),
  };
};
