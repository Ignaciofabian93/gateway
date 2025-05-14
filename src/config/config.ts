export const environment = process.env.ENVIRONMENT ?? "development";
export const subgraphsURLs = {
  users: environment !== "development" ? "https://users.ekoru.cl/graphql" : "http://localhost:4001/graphql",
  products: environment !== "development" ? "https://products.ekoru.cl/graphql" : "http://localhost:4002/graphql",
};
