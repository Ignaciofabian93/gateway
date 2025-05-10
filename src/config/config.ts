export const environment = process.env.ENVIRONMENT ?? "development";
console.log("ENVIRONMENT:: ", environment);

export const subgraphsURLs = {
  users: environment !== "development" ? "http://users_subgraph:4001/graphql" : "http://localhost:4001/graphql",
  products: environment !== "development" ? "http://products_subgraph:4002/graphql" : "http://localhost:4002/graphql",
};
