import { Content } from "./Content";

export type Search = {
  keyword: string;
  bestContents: Content[];
  goodContents: Content[];
  contents: Content[];
  providers: string[];
  startedAt: Date;
  finishedAt: Date;
  duration: number;
};
