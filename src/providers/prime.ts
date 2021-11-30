import puppeteer, { ElementHandle } from "puppeteer";
import { Content } from "../entities/Content";

export const primeSearch = async (keyWord: string) => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(`https://www.primevideo.com/search/?phrase=${keyWord}`);

  const containers = await page.$$<HTMLDivElement>(".av-hover-wrapper");

  const contents = await Promise.all(containers.map(getPicture));

  console.log(contents);

  await browser.close();
};

const getPicture = async (
  container: ElementHandle<HTMLDivElement>
): Promise<Content> => {
  const img = await container.$("img");
  const src = await img.getProperty("src");
  const url = await src.jsonValue<string>();

  const description = await container.$eval(
    "p",
    (element) => element.textContent
  );

  const title = await container.$eval(
    "span > a",
    (element) => element.textContent
  );

  return {
    pictures: [url],
    description,
    title,
    provider: "prime",
  };
};
