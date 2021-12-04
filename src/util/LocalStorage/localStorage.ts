import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { Page } from "puppeteer";
import { Provider } from "../../entities/Content";
import { StorageItem } from "./StorageItem";

export const save = async (provider: Provider, page: Page) => {
  const path = resolve(__dirname, `${provider}.localStorage`);

  const storageItemsJson = await page.evaluate(() => {
    const storageItems: StorageItem[] = Array.from({
      length: localStorage.length,
    }).map((_, index) => {
      const key = localStorage.key(index);
      const value = localStorage.getItem(key);
      return {
        key,
        value,
      };
    });

    const storageItemsJson = JSON.stringify(storageItems);

    return storageItemsJson;
  });

  await writeFile(path, storageItemsJson);
};

export const load = async (provider: Provider, page: Page) => {
  const path = resolve(__dirname, `${provider}.localStorage`);

  const storageStemsJson = await readFile(path, "utf-8").catch(() => null);
  if (!storageStemsJson) return;

  await page.evaluateOnNewDocument((storageStemsJson) => {
    const storageItems = JSON.parse(storageStemsJson) as StorageItem[];

    storageItems.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
    });
  }, storageStemsJson);
};
