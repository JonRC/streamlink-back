import { readFileSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { Protocol } from "puppeteer";

import { Provider } from "../../entities/Content";

export const save = (
  provider: Provider,
  cookies: Protocol.Network.Cookie[]
) => {
  const storagePath = resolve(__dirname, `${provider}.cookies`);
  const cookiesJson = JSON.stringify(cookies);
  writeFileSync(storagePath, cookiesJson);
};

export const load = async (
  provider: Provider
): Promise<Protocol.Network.Cookie[]> => {
  const storagePath = resolve(__dirname, `${provider}.cookies`);
  const cookiesJson = await readFile(storagePath, "utf-8").catch(() => null);
  if (!cookiesJson) return [];

  return JSON.parse(cookiesJson) as Protocol.Network.Cookie[];
};
