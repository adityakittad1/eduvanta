export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    FRONTEND_URL: string;
    FILE_UPLOAD_DIR: string;
    FILE_UPLOAD_MAX_SIZE_MB: number;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    ROOT_DOMAIN: string;
    AI_PROVIDER?: string | undefined;
    AI_API_KEY?: string | undefined;
    AI_MODEL?: string | undefined;
    SUPABASE_URL?: string | undefined;
    SUPABASE_SERVICE_KEY?: string | undefined;
};
export type Env = typeof env;
//# sourceMappingURL=env.d.ts.map