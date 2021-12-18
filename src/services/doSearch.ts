import { findBestMatch } from "string-similarity";
import { Content } from "../entities/Content";
import { Search } from "../entities/Search";
import { DateUtil } from "../util/Date";
import { disneySearch } from "./disney";
import { globoplaySearch } from "./globoplay";
import { hboSearch } from "./hbo";
import { netflixSearch } from "./netflix";
import { primeSearch } from "./prime";

export const doSearch = async (keyword: string): Promise<Search> => {
  const startedAt = new Date();

  const minBestRate = 0.9;
  const minGoodRate = 0.1;

  const providerPromises = contentProviders.map((provider) =>
    emptyOnError(provider)(keyword)
  );

  const providerResults = await Promise.all(providerPromises).then(
    (nestedContents) => nestedContents.filter((contents) => contents.length)
  );

  const providers = providerResults.map((contents) => contents[0].provider);

  const rawContents = flatContent(providerResults);

  const matches = findBestMatch(
    keyword.toLowerCase(),
    rawContents.map((content) => content.title.toLowerCase())
  );

  const contents: Content[] = rawContents.map((rawContent, index) => ({
    ...rawContent,
    rating: {
      rate: matches.ratings[index].rating,
      keyword,
    },
  }));

  const bestContents = contents.filter(
    (content) => content.rating.rate >= minBestRate
  );

  const goodContents = contents.filter(
    (content) => content.rating.rate >= minGoodRate
  );

  const finishedAt = new Date();

  const search: Search = {
    bestContents,
    contents,
    keyword,
    providers,
    goodContents,
    startedAt,
    finishedAt,
    duration: DateUtil.diff(finishedAt, startedAt),
  };

  return search;
};

type ContentProvider = (keyword: string) => Promise<Omit<Content, "rating">[]>;

const contentProviders: ContentProvider[] = [
  disneySearch,
  globoplaySearch,
  hboSearch,
  netflixSearch,
  primeSearch,
];

type emptyOnError = <R, P>(
  fn: (...params: P[]) => Promise<R[]>
) => (...params: P[]) => Promise<R[]>;

const emptyOnError: emptyOnError =
  (fn) =>
  (...params) =>
    fn(...params).catch((error) => {
      console.error(error);
      return [];
    });

type flatContent = (
  nestedContents: Omit<Content, "rating">[][]
) => Omit<Content, "rating">[];

const flatContent: flatContent = (nestedContents) => {
  const biggestLength = Math.max(
    ...nestedContents.map((nestedContent) => nestedContent.length)
  );

  const contents: Omit<Content, "rating">[] = [];

  for (let index = 0; index < biggestLength; index++) {
    const sameLevelContents = nestedContents
      .map((nestedContent) => nestedContent?.[index])
      .filter((content) => content);

    contents.push(...sameLevelContents);
  }

  return contents;
};
