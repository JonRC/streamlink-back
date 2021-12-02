export type Content = {
  pictures: string[];
  description?: string;
  title: string;
  url: string;
  provider: "netflix" | "prime" | "globoplay" | "hbo" | "disney";
};
