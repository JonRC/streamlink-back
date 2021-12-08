import { config } from "dotenv";
import { writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { CookiesStorage } from "../util";
config();

import puppeteer, { ElementHandle, Page, Protocol } from "puppeteer";
import { stringify } from "query-string";
import { Content } from "../entities/Content";

export const netflixSearch = async (keyWork: string): Promise<Content[]> => {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  const query = stringify({
    q: keyWork,
  });

  const cookies = await CookiesStorage.load("netflix");

  await page.setCookie(...cookies);

  await page.goto(`https://www.netflix.com/search?${query}`);

  await page
    .waitForSelector(".search", {
      timeout: 5000,
    })
    .catch(async () => {
      await login(page);
      await page.goto(`https://www.netflix.com/search?${query}`);
      await page.waitForSelector(".search");
    });

  const validSearch = await page
    .waitForSelector(".title-card-container")
    .catch((error) => false);
  if (!validSearch) return [];

  const containers = await page.$$<HTMLDivElement>(".title-card-container");

  const contents = await Promise.all(containers.map(getContent));

  await browser.close();

  return contents;
};

const login = async (page: Page) => {
  const login = process.env.NETFLIX_USERNAME;
  const password = process.env.NETFLIX_PASSWORD;

  /**
   * Id and password
   */
  await page.goto("https://www.netflix.com/login");
  await page.waitForSelector("#id_userLoginId");
  await page.type("#id_userLoginId", login);
  await page.type("#id_password", password);
  await page.click("button[type=submit]");

  /**
   * Choose profile
   */
  await page.waitForSelector(".profile-link");
  await page.click(".profile-link");

  /**
   * Persist cache
   */
  const cookies = await page.cookies();
  CookiesStorage.save("netflix", cookies);
};

const getCookie = async () => {
  const cookieBuffer = await readFile("./netflix.cookies").catch((error) => {
    console.error(error);
    return "[]";
  });

  const cookies = JSON.parse(
    cookieBuffer?.toString("utf-8")
  ) as Protocol.Network.Cookie[];

  return cookies;
};

const getContent = async (
  container: ElementHandle<HTMLDivElement>
): Promise<Content> => {
  const title = await container.$eval(
    "p.fallback-text",
    (element) => element?.textContent
  );

  const image = await container.$eval(
    "img",
    (element: HTMLImageElement) => element?.src
  );

  const holeUrl = await container.$eval(
    "img",
    (element: HTMLImageElement) => element.closest("a")?.href
  );

  const url = holeUrl.split("?")[0];

  return {
    pictures: [image],
    title,
    url,
    provider: "netflix",
  };
};
