import { config } from "dotenv";
config();

import { CookiesStorage, LocalStorage } from "../util";
import crypto from "crypto";

import puppeteer, { Page } from "puppeteer";
import axios from "axios";
import { DisneySearch } from "../entities/DisneySearch";
import { Content } from "../entities/Content";

type Auth = { context: { token: string } };

export const disneySearch = async (
  keyWord: string
): Promise<Omit<Content, "rating">[]> => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const cookies = await CookiesStorage.load("disney");
  await page.setCookie(...cookies);
  await LocalStorage.load("disney", page);

  const authJson = await getAuthJson(page);
  await browser.close();
  const auth = JSON.parse(authJson) as Auth;

  const { token } = auth.context;

  const url = `https://disney.content.edge.bamgrid.com/svc/search/disney/version/5.1/region/BR/audience/k-false,l-false/maturity/1450/language/pt-BR/queryType/ge/pageSize/30/query/${keyWord}`;

  const { data } = await axios.get<DisneySearch>(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const { hits } = data.data.search;

  const contents: Omit<Content, "rating">[] = hits.map((hit) => {
    const videoId = hit?.hit?.family?.encodedFamilyId;
    const randomString = crypto.randomBytes(2).toString("hex");
    const picture = getUrl(hit?.hit?.image?.tile["1.78"]);
    const title = getContent(hit?.hit?.text?.title);

    return {
      provider: "disney",
      pictures: [picture],
      title: title,
      url: `https://www.disneyplus.com/pt-br/movies/${randomString}/${videoId}`,
      foundAt: new Date(),
    };
  });

  return contents;
};

const getAuthJson = async (page: Page) => {
  await page.goto(`https://www.disneyplus.com/select-profile`);
  await page
    .waitForSelector(".profile-avatar-appear-done", { timeout: 8000 })
    .catch(async () => {
      await login(page);
    });

  const authJson = await tokenFromLocalStorage(page);

  return authJson;
};

const tokenFromLocalStorage = async (page: Page): Promise<string | null> => {
  const tokenJson = await page.evaluate(() => {
    const tokenKey = Object.keys(localStorage).find((key) =>
      key.match("access--disney")
    );
    const tokenJson = localStorage.getItem(tokenKey);
    return tokenJson;
  });

  return tokenJson;
};

const login = async (page: Page) => {
  const login = process.env.DISNEY_USERNAME;
  const password = process.env.DISNEY_PASSWORD;

  await page.goto(`https://www.disneyplus.com/login`);

  await page.waitForSelector("#email");
  await page.type("#email", login);
  await page.click("button[type=submit]");

  await page.waitForSelector("#password");
  await page.type("#password", password);
  await page.click("button[type=submit]");

  await page.waitForSelector(".profile-avatar-appear-done");

  const cookies = await page.cookies();
  CookiesStorage.save("disney", cookies);
  await LocalStorage.save("disney", page);

  await page.goto(`https://www.disneyplus.com/select-profile`);
  await page.waitForSelector(".profile-avatar-appear-done", { timeout: 8000 });
};

const getUrl = (obj: Record<string, any>) => {
  for (const key in obj) {
    if (key === "url") return obj[key];
    if (typeof obj[key] === "object") return getUrl(obj[key]);
  }
  return undefined;
};

const getContent = (obj: Record<string, any>) => {
  for (const key in obj) {
    if (key === "content") return obj[key];
    if (typeof obj[key] === "object") return getContent(obj[key]);
  }
  return undefined;
};
