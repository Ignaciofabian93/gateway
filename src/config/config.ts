const allowedEnvironments = ["production", "qa", "development"] as const;
type Environment = (typeof allowedEnvironments)[number];

const env = process.env.ENVIRONMENT;
export const environment: Environment = allowedEnvironments.includes(env as Environment)
  ? (env as Environment)
  : "development";

// Define URLs for each environment
const urlsByEnv = {
  development: {
    users: process.env.USER_SERVICE_DEV_URL ?? undefined,
    products: process.env.PRODUCT_SERVICE_DEV_URL ?? undefined,
    search: process.env.SEARCH_SERVICE_DEV_URL ?? undefined,
    transaction: process.env.TRANSACTION_SERVICE_DEV_URL ?? undefined,
    blog: process.env.BLOG_SERVICE_DEV_URL ?? undefined,
    community: process.env.COMMUNITY_SERVICE_DEV_URL ?? undefined,
  },
  qa: {
    users: process.env.USER_SERVICE_QA_URL ?? undefined,
    products: process.env.PRODUCT_SERVICE_QA_URL ?? undefined,
    search: process.env.SEARCH_SERVICE_QA_URL ?? undefined,
    transaction: process.env.TRANSACTION_SERVICE_QA_URL ?? undefined,
    blog: process.env.BLOG_SERVICE_QA_URL ?? undefined,
    community: process.env.COMMUNITY_SERVICE_QA_URL ?? undefined,
  },
  production: {
    users: process.env.USER_SERVICE_PROD_URL ?? undefined,
    products: process.env.PRODUCT_SERVICE_PROD_URL ?? undefined,
    search: process.env.SEARCH_SERVICE_PROD_URL ?? undefined,
    transaction: process.env.TRANSACTION_SERVICE_PROD_URL ?? undefined,
    blog: process.env.BLOG_SERVICE_PROD_URL ?? undefined,
    community: process.env.COMMUNITY_SERVICE_PROD_URL ?? undefined,
  },
};

// Export URLs based on current environment
export const subgraphsURLs = urlsByEnv[environment];

// Images configuration
export const imagesConfig = {
  development: {
    basePath: process.env.DEV_IMAGES_PATH || "/public/images",
    baseUrl: "http://localhost:9000/images",
  },
  qa: {
    basePath: process.env.HOME || "/home/ekoru/images",
    baseUrl: process.env.IMAGES_BASE_URL || "https://qa.gateway.ekoru.cl/images",
  },
  production: {
    basePath: "/home/ekoru/images",
    baseUrl: "https://gateway.ekoru.cl/images",
  },
};

export const getImagesConfig = () => imagesConfig[environment];
