import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from "@apollo/gateway";
import express from "express";
import cors from "cors";
import http from "http";
import fs from "fs";
import cookieParser from "cookie-parser";
import Auth from "./auth/route";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "users", url: "http://localhost:4001/graphql" },
      // { name: "reviews", url: "http://localhost:4002" },
      // { name: "items", url: "http://localhost:4003" },
    ],
  }),
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context?.token) {
          request.http?.headers.set("Authorization", `Bearer ${context.token}`);
        }
      },
    });
  },
});

const server = new ApolloServer({ gateway });

await server.start();

const app = express();

const PORT = 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser()
);
app.use("/auth", Auth);
app.use(
  `/`,
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      console.log("REQ:: ", req.body);
      const cookieToken = req.cookies.token;
      const headersToken = req.headers.authorization?.split(" ")[1];
      const token = cookieToken || headersToken || "";
      console.log("TOKEN:; ", token);

      return { token, req, res };
    },
  })
);

http.createServer(app).listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}`);
});
