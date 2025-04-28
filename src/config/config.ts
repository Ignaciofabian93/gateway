export const environment = process.env.ENVIRONMENT ?? "development";

export const subgraphsURLs = {
  users: environment !== "development" ? "http://74.208.96.137:4001/graphql" : "http://localhost:4001/graphql",
  products: environment !== "development" ? "http://74.208.96.137:4002/graphql" : "http://localhost:4002/graphql",
};
