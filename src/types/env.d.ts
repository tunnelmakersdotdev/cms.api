declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    NODE_PORT: string;
    DEBUG_MODE: "true" | "false";
    JWT_SECRET: string;
    AWS_BUCKET_NAME: string;
  }
}
