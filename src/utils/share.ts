import { m } from '#/paraglide/messages';

export function canShare() {
  return 'function' === typeof navigator.share;
}

/**
 * Wraps navigator.share with a fallback to twitter for unsupported browsers
 */
export function share(opts: ShareData) {
  if (canShare()) {
    return navigator.share(opts);
  } else {
    const { title, url } = opts;
    if (!url || !title) return Promise.reject();
    const width = 550;
    const height = 420;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const params = `scrollbars=no,menubar=no,toolbar=no,status=no,width=${width},height=${height},top=${top},left=${left}`;
    const tweetLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      title,
    )}`;
    window.open(tweetLink, '_blank', params);
    return Promise.resolve();
  }
}

export async function shareInviteUrl(
  url: string,
  values: { roomName: string; appName: string },
  inEnglish: boolean,
  event: Event,
) {
  if (!values) values = { roomName: 'RoomName', appName: m['app-name']() };
  try {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const data = {
      title: m['invite-popover.share-title'](values),
      text: `${m['invite-popover.what-this-is']({ appName: values.appName })} ${m['app-description']}`,
      url: url,
    };
    console.info(`attempting to share:`, data);
    await share(data);
    return true;
  } catch (error) {
    console.error('unable to share:', error);
    return false;
  }
}
