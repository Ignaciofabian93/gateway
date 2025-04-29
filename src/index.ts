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
import { subgraphsURLs } from "./config/config";

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
    origin: ["http://localhost:3000", "http://74.208.96.137:5000"],
    credentials: true,
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser(),
);
app.use("/auth", auth);

app.use(
  `/`,
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const cookieToken = req.cookies.token;
      const headersToken = req.headers.authorization?.split(" ")[1];
      const token = cookieToken || headersToken || "";
      return { token, req, res };
    },
  }),
);

http.createServer(app).listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}`);
});
