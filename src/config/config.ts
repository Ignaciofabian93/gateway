const allowedEnvironments = ["production", "qa", "development"] as const;
type Environment = (typeof allowedEnvironments)[number];

const env = process.env.ENVIRONMENT;
export const environment: Environment = allowedEnvironments.includes(env as Environment)
  ? (env as Environment)
  : "development";

// Define URLs for each environment
const urlsByEnv = {
  development: {
    users: "http://localhost:4001/graphql",
    products: "http://localhost:4002/graphql",
    search: "http://localhost:4003/graphql",
  },
  qa: {
    users: "http://users_subgraph_prod:4001/graphql",
    products: "http://products_subgraph_prod:4002/graphql",
    search: "http://search_subgraph_prod:4003/graphql",
  },
  production: {
    users: "http://users_subgraph_prod:4001/graphql",
    products: "http://products_subgraph_prod:4002/graphql",
    search: "http://search_subgraph_prod:4003/graphql",
  },
};

// Export URLs based on current environment
export const subgraphsURLs = urlsByEnv[environment];
