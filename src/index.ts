import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
  GraphQLDataSourceProcessOptions,
} from "@apollo/gateway";
import express, { Response, Request } from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import auth from "./auth/route";
import { subgraphsURLs, environment } from "./config/config";

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
      { name: "users", url: subgraphsURLs.users },
      { name: "products", url: subgraphsURLs.products },
      { name: "search", url: subgraphsURLs.search },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({
  gateway,
  introspection: true,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return error;
  },
});

await server.start();

const app = express();

const PORT = process.env.PORT || 4000;

const origin =
  environment !== "development"
    ? ["https://app.ekoru.cl"]
    : ["http://localhost:3000", "http://69.48.204.85:3000", "http://ekoru-web:3000"];

app.use(
  cors({
    origin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

app.use("/session", auth);

app.use(
  `/graphql`,
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const cookieToken = req.cookies.token || req.cookies.refreshToken;
      const headersToken = req.headers.authorization?.split(" ")[1];
      const token = cookieToken || headersToken || "";

      return { token, req, res };
    },
  }),
);

http.createServer(app).listen(PORT, () => {
  console.log(`Gateway running on port: ${PORT}`);
});
