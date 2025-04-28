import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
  GraphQLDataSourceProcessOptions,
} from "@apollo/gateway";
import express, { Response, Request, RequestHandler } from "express";
import cors from "cors";
import http from "http";
import fs from "fs";
import cookieParser from "cookie-parser";
import auth from "./auth/route";

type Context = {
  token?: string;
  req?: Request;
  res?: Response;
};

class AuthenticatedDataSource extends RemoteGraphQLDataSource<Context> {
  willSendRequest(options: GraphQLDataSourceProcessOptions) {
    const { request, context } = options;
    if (context?.token) {
      request.http?.headers.set("Authorization", `Bearer ${context.token}`);
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: "http://localhost:4001/graphql" },
      { name: "products", url: "http://localhost:4002/graphql" },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({ gateway });

await server.start();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: "*",
    credentials: true,
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser()
);
app.use("/auth", auth);

const GraphQLMiddleware = expressMiddleware(server, {
  context: async ({ req, res }) => {
    const cookieToken = req.cookies.token;
    const headersToken = req.headers.authorization?.split(" ")[1];
    const token = cookieToken || headersToken || "";
    return { token, req, res };
  },
}) as RequestHandler;

app.use(`/`, (req, res, next) => GraphQLMiddleware(req, res, next));

http.createServer(app).listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}`);
});
