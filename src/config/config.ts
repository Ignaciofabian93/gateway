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
    transaction: "http://localhost:4004/graphql",
  },
  qa: {
    users: "http://users_subgraph_qa:4101/graphql",
    products: "http://products_subgraph_qa:4102/graphql",
    search: "http://search_subgraph_qa:4103/graphql",
    transaction: "http://transaction_subgraph_qa:4104/graphql",
  },
  production: {
    users: "http://users_subgraph_prod:4001/graphql",
    products: "http://products_subgraph_prod:4002/graphql",
    search: "http://search_subgraph_prod:4003/graphql",
    transaction: "http://transaction_subgraph_prod:4004/graphql",
  },
};

// Export URLs based on current environment
export const subgraphsURLs = urlsByEnv[environment];

// Images configuration
export const imagesConfig = {
  development: {
    basePath: process.env.DEV_IMAGES_PATH || "/public/images",
    baseUrl: "http://localhost:4000/images",
  },
  qa: {
    basePath: "/home/ekoru/images",
    baseUrl: "https://qa.gateway.ekoru.cl/images",
  },
  production: {
    basePath: "/home/ekoru/images",
    baseUrl: "https://gateway.ekoru.cl/images",
  },
};

export const getImagesConfig = () => imagesConfig[environment];
