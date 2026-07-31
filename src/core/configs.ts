import { createStore, type StoreAction } from '@tanstack/store';

// TODO: Inject env vars from server
// TODO: (ALSO) Migrate reticulum to JS?

interface HubsAppConfig {
  features: {
    defaultRoomSize: number;
    disableRoomCreation: boolean;
    maxRoomSize: number;
    showCompanyLogo: boolean;
    showCommunityLink: boolean;
    showControlsLink: boolean;
    showDocsLink: boolean;
    showIssueReportLink: boolean;
    showPrivacy: boolean;
    showTerms: boolean;
    showWhatsNewLink: boolean;
  };
  images: {
    companyLogo: string;
    favicon: string;
    homeBackground: string;
    logo: string;
    logoDark: string;
  };
  links: {
    community: 'https://discord.gg/dFJncWwHun';
    issueReport: 'https://docs.hubsfoundation.org/help.html';
    docs: 'https://docs.hubsfoundation.org';
    controls: 'https://docs.hubsfoundation.org/hubs-controls.html';
    termsOfUse: 'https://hubsfoundation.org/hubs-terms-of-use';
    privacyNotice: 'https://hubsfoundation.org/hubs-privacy-policy';
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

interface HubsConfigActions extends Record<string, StoreAction> {
  features: (name: keyof HubsAppConfig['features']) => number | boolean;
  link: (name: keyof HubsAppConfig['links']) => string;
}

export const configs = createStore<HubsConfig, HubsConfigActions>(
  {
    appConfig: {
      features: {
        defaultRoomSize: 10,
        disableRoomCreation: false,
        maxRoomSize: 50,
        showCompanyLogo: true,
        showCommunityLink: false,
        showControlsLink: true,
        showDocsLink: false,
        showIssueReportLink: false,
        showPrivacy: false,
        showTerms: false,
        showWhatsNewLink: false,
      },
      images: {
        companyLogo: '',
        favicon: '',
        homeBackground: '',
        logo: '',
        logoDark: '',
      },
      links: {},
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
  },

  ({ setState, get }) => ({
    features: (name: keyof HubsAppConfig['features']) =>
      get().appConfig.features[name],
    link: (name: keyof HubsAppConfig['links']) => get().appConfig.links[name],
  }),
);

export function setIsAdmin(isAdmin: boolean) {
  configs.setState((prev) => ({ ...prev, isAdmin: isAdmin }));
}
