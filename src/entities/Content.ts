export type Content = {
  pictures: string[];
  description?: string;
  title: string;
  url: string;
  provider: Provider;
};

export type Provider = "netflix" | "prime" | "globoplay" | "hbo" | "disney";
