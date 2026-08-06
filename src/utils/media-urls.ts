import { configs } from '#/core/configs';

const nonCorsProxyDomains = (configs.state.nonCorsProxyDomains || '').split(
  ',',
);
if (configs.state.corsProxyServer) {
  const split = configs.state.corsProxyServer.split(':');
  if (split[0]) nonCorsProxyDomains.push(split[0]);
}

export function isNonCorsProxyDomain(hostname: string) {
  return nonCorsProxyDomains.find((domain) => hostname.endsWith(domain));
}

export function proxiedUrlFor(url: string) {
  if (!(url.startsWith('http:') || url.startsWith('https:'))) return url;

  // Skip known domains that do not require CORS proxying.
  try {
    const parsedUrl = new URL(url);
    if (isNonCorsProxyDomain(parsedUrl.hostname)) return url;
  } catch {
    // Ignore
  }

  return `https://${configs.state.corsProxyServer}/${url}`;
}
