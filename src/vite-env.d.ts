/// <reference types="vite-plugin-svgr/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly HUBS_SHORTLINK_DOMAIN: string;
  readonly HUBS_RETICULUM_SERVER: string;
  readonly HUBS_CORS_PROXY_SERVER: string;
  readonly HUBS_THUMBNAIL_SERVER: string;
  readonly ASSET_BUNDLE_SERVER: string;
  readonly HUBS_NON_CORS_PROXY_DOMAINS: string;
  readonly HUBS_BASE_ASSETS_PATH: string;
  readonly HUBS_LOAD_HUBS_APP_CONFIG: boolean;
  readonly HUBS_CONFIGURABLE_SERVICES: string;
  readonly HUBS_ITA_SERVER: string;
  readonly HUBS_HOST: string;
  readonly HUBS_RETICULUM_SOCKET_SERVER: string;
  readonly HUBS_GA_TRACKING_ID: string;
  readonly HUBS_UPLOADS_HOST: string;
  readonly HUBS_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
