import puppeteer from "puppeteer";
import { stringify } from "query-string";

const netflixSearch = async (keyWork: string) => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  const query = stringify({
    q: keyWork,
  });

  console.log(query);

  await page.type("#id_userLoginId", process.env.NEXTFLIX_USERNAME);
  await page.type("#id_password", process.env.NEXTFLIX_PASSWORD);

  await page.goto("https://www.netflix.com/login");
};

netflixSearch("test");
