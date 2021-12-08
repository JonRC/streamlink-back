import puppeteer, { ElementHandle } from "puppeteer";
import { Content } from "../entities/Content";

export const primeSearch = async (keyWord: string): Promise<Content[]> => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.primevideo.com/search/?phrase=${keyWord}`);

  const containers = await page.$$<HTMLDivElement>(".av-hover-wrapper");

  const contents = await Promise.all(containers.map(getPicture));

  await browser.close();

  return contents;
};

const getPicture = async (
  container: ElementHandle<HTMLDivElement>
): Promise<Content> => {
  const imageElement = await container.$("img");
  const srcProperty = await imageElement.getProperty("src");
  const image = await srcProperty.jsonValue<string>();

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

  return {
    pictures: [image],
    description,
    title,
    provider: "prime",
    url: url,
  };
};
