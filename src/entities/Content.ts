export type Content = {
  pictures: string[];
  description?: string;
  title: string;
  url: string;
  provider: Provider;
  startedAt: Date;
  foundAt: Date;
  duration: number;
  rating: {
    rate: number;
    keyword: string;
  };
};

export type Provider = "netflix" | "prime" | "globoplay" | "hbo" | "disney";
