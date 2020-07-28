import express from "express";
import { RootInterface } from "./root";

export type GqlContext = RootInterface & {
  headers: {
    [key: string]: string | string[];
  };
  jwt?: string;
};

export const appContext = (root: RootInterface) => ({
  req,
}: {
  req: express.Request;
}): GqlContext => {
  return {
    ...root,
    headers: req.headers,
    jwt: req.cookies.jwt,
  };
};
