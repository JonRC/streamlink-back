import puppeteer, { ElementHandle } from "puppeteer";
import { Content } from "../entities/Content";
import { DateUtil } from "../util/Date";

export const primeSearch = async (
  keyWord: string
): Promise<Omit<Content, "rating">[]> => {
  const startedAt = new Date();

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.primevideo.com/search/?phrase=${keyWord}`);

  const containers = await page.$$<HTMLDivElement>(".av-hover-wrapper");

  const contents = await Promise.all(containers.map(getPicture(startedAt)));

  await browser.close();

  return contents;
};

const getPicture =
  (startedAt: Date) =>
  async (
    container: ElementHandle<HTMLDivElement>
  ): Promise<Omit<Content, "rating">> => {
    const imageElement = await container.$("img");
    const srcProperty = await imageElement.getProperty("src");
    const imageUrl = await srcProperty.jsonValue<string>();

    const description = await container.$eval(
      "p",
      (element) => element.textContent
    );

    const title = await container.$eval(
      "span > a",
      (element) => element.textContent
    );

    const url = await container.$eval(
      "a",
      (element: HTMLAnchorElement) => element.href
    );

    const foundAt = new Date();

    return {
      image: {
        url: imageUrl,
      },
      description,
      title,
      provider: "prime",
      url: url,
      foundAt,
      startedAt,
      duration: DateUtil.diff(foundAt, startedAt),
    };
  };
