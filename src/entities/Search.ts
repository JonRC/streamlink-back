import { Content } from "./Content";

export type Search = {
  keyword: string;
  bestContents: Content[];
  contents: Content[];
  providers: string[];
};
