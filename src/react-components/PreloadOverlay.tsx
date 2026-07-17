import Button from './input/Button';
import { m } from '@/paraglide/messages.js';

interface HubsScene {
  screenshot_url: string;
}

export default function PreloadOverlay({
  hubName,
  hubScene,
}: {
  hubName?: string;
  hubScene?: HubsScene;
  baseUrl?: URL;
  onLoadClicked?: () => void;
}) {
  // REIMP
  return (
    <div className="treatment">
      <div className="screenshot">
        {hubScene && (
          <img className="screenshot" src={hubScene.screenshot_url} />
        )}
      </div>
      <a href="/" target="_blank" rel="noopener noreferrer" className="logo">
        <img
          // src={configs.image("logo")}
          src={''}
          alt={m['preload-overlay.logo-alt']()}
        />
      </a>
      <div className="main-panel">
        <div className="hub-name">{hubName}</div>
        {/* {onLoadClicked &&
          (!isMobile ? (
            <Button preset="primary" onClick={onLoadClicked}>
              {loadButtonText}
            </Button>
          ) : (
            <Button
              preset="primary"
              as="a"
              href={baseUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              {loadButtonText}
            </Button>
          ))} */}
      </div>
    </div>
  );
}
