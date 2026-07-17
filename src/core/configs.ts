import { createStore } from '@tanstack/store';

// TODO: Inject env vars from server
// TODO: (ALSO) Migrate reticulum to JS?

interface HubsAppConfig {
  features: {
    defaultRoomSize: number;
    maxRoomSize: number;
    showCompanyLogo: boolean;
    showIssueReportLink: boolean;
  };
  images: {
    companyLogo: string;
    favicon: string;
    homeBackground: string;
    logo: string;
    logoDark: string;
  };
}

interface AvailableIntegrations {
  bing_images: boolean;
  bing_videos: boolean;
  icosa: boolean;
  sketchfab: boolean;
  tenor: boolean;
  twitch: boolean;
  twitter: boolean;
  youtube_videos: boolean;
}

interface HubsConfig {
  appConfig: HubsAppConfig;
  availableIntegrations: AvailableIntegrations;
  baseAssetsPath: string;
  corsProxyServer: string;
  gaTrackingId: string;
  isLocalOrCustomClient: boolean;
  nonCorsProxyDomains: string;
  reticulumServer?: string;
  sentryDsn: string;
  shortlinkDomain: string;
  thumbnailServer: string;
  uploadsHost?: string;
  hasThumbnailServerMetaTag: boolean;
  isAdmin: boolean;
}

export const configs = createStore<HubsConfig>({
  appConfig: {
    features: {
      defaultRoomSize: 10,
      maxRoomSize: 50,
      showCompanyLogo: true,
      showIssueReportLink: true,
    },
    images: {
      companyLogo: '',
      favicon: '',
      homeBackground: '',
      logo: '',
      logoDark: '',
    },
  },
  availableIntegrations: {
    bing_images: false,
    bing_videos: false,
    icosa: false,
    sketchfab: false,
    tenor: false,
    twitch: false,
    twitter: false,
    youtube_videos: false,
  },
  baseAssetsPath: import.meta.env.HUBS_BASE_ASSETS_PATH,
  corsProxyServer: import.meta.env.HUBS_CORS_PROXY_SERVER,
  gaTrackingId: import.meta.env.HUBS_GA_TRACKING_ID,
  isLocalOrCustomClient: false,
  nonCorsProxyDomains: import.meta.env.HUBS_NON_CORS_PROXY_DOMAINS,
  reticulumServer: import.meta.env.HUBS_RETICULUM_SERVER,
  sentryDsn: import.meta.env.HUBS_SENTRY_DSN,
  shortlinkDomain: import.meta.env.HUBS_SHORTLINK_DOMAIN,
  thumbnailServer: import.meta.env.HUBS_THUMBNAIL_SERVER,
  hasThumbnailServerMetaTag: false,
  isAdmin: false,
});

export function setIsAdmin(isAdmin: boolean) {
  configs.setState((prev) => ({ ...prev, isAdmin: isAdmin }));
}
