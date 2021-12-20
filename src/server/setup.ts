import express from "express";
import cors from "cors";
import { MainRouter } from "./router";

export const serverSetup = () => {
  const app = express();

  const port = process.env.PORT || 3003;

  app.use(
    cors({
      origin: "*",
    })
  );

  app.use((request, response, next) => {
    console.log(new Date());
    next();
  });

  app.use(express.json());

  app.use(MainRouter);

  app.listen(port, () => console.log("on"));

  return app;
};
