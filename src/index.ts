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
import imageRoutes from "./routes/images";
import coverImageRouter from "./routes/cover-image";
import profileImageRouter from "./routes/profile-image";
import { subgraphsURLs, environment, getImagesConfig } from "./config/config";
import { decodedToken } from "./middleware/auth";

type Context = {
  token?: string;
  req?: Request;
  res?: Response;
  userId?: string;
  extensions?: {
    userId?: string;
  };
};

class AuthenticatedDataSource extends RemoteGraphQLDataSource<Context> {
  willSendRequest(options: GraphQLDataSourceProcessOptions) {
    const { request, context } = options;
    if (context?.token) {
      request.http?.headers.set("Authorization", `Bearer ${context.token}`);
    }

    const userId = context?.userId || context?.extensions?.userId;
    if (userId) {
      request.http?.headers.set("x-user-id", userId);
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: subgraphsURLs.users },
      { name: "products", url: subgraphsURLs.products },
      // { name: "search", url: subgraphsURLs.search },
      // { name: "transaction", url: subgraphsURLs.transaction },
      // { name: "blog", url: subgraphsURLs.blog },
      // { name: "community", url: subgraphsURLs.community },
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

const PORT = process.env.PORT || 9000;

const origin =
  environment === "development"
    ? "http://localhost:3000"
    : environment === "qa"
      ? "https://qa.app.ekoru.cl"
      : "https://app.ekoru.cl";

console.log("Current environment:", environment);
console.log("Allowed origins:", origin);

app.use(
  cors({
    origin,
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// Serve static files for images from Ubuntu server
// For development: use local path, for production: mount Ubuntu server path
const config = getImagesConfig();
console.log("config:: ", config);

app.use("/images", express.static(config.basePath));

app.use("/session", auth);
app.use("/api/images", imageRoutes);
app.use("/api/cover-image", coverImageRouter);
app.use("/api/profile-image", profileImageRouter);

app.use(
  `/graphql`,
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const cookieToken = req.cookies.token || req.cookies.refreshToken;
      const headersToken = req.headers.authorization?.split(" ")[1];
      const token = cookieToken || headersToken || "";
      const userId = decodedToken(token)?.userId;
      return {
        token,
        req,
        res,
        userId,
        extensions: {
          userId: userId,
        },
      };
    },
  }),
);

http.createServer(app).listen(PORT, () => {
  console.log(`Gateway running on port: ${PORT}`);
  console.log(`Environment: ${environment}`);
  console.log(`Subgraphs URLs: ${JSON.stringify(subgraphsURLs, null, 2)}`);
});
