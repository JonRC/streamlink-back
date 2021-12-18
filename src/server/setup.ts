import express from "express";
import cors from "cors";
import { MainRouter } from "./router";

export const serverSetup = () => {
  const app = express();

  const port = process.env.PORT || 3000;

  app.use(express.json());

  app.use(cors());

  app.use(MainRouter);

  app.listen(port, () => console.log(`Server is running on port ${port} 🚀`));

  return app;
};
