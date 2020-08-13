import { ApolloServer } from "apollo-server-express";
import express from "express";
import cookieParser from "cookie-parser";

import { schema } from "@generated/graphql/schema";

import { appContext } from "./context";
import { root } from "./root";

// We are keeping async here because we want to be able to await operations without changing the API of createApp.
export const createApp = async () => {
  const app = express();

  app.use([cookieParser()]);

  // FIXES CORS ERROR -
  // so if you need to block other domains, you have an example
  const whitelist = [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://xolv.io",
    "https://xolv.io",
  ];

  const corsOptions = {
    origin(origin, callback) {
      const originIsWhitelisted = whitelist.indexOf(origin) !== -1 || !origin;
      callback(null, originIsWhitelisted);
    },
    credentials: true,
  };

  const apollo = new ApolloServer({
    schema,
    context: appContext(root),
  });

  apollo.applyMiddleware({ app, cors: corsOptions });

  return { app };
};
