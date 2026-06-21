import { FormattedMessage, useIntl } from 'react-intl'
import Button from './input/Button'

interface HubsScene {
  screenshot_url: string
}

export default function PreloadOverlay({
  hubName,
  hubScene,
  baseUrl,
  onLoadClicked,
}: {
  hubName?: string
  hubScene?: HubsScene
  baseUrl?: string
  onLoadClicked?: () => void
}) {
  const intl = useIntl()
  // REIMP
  const isMobile = false
  const loadButtonText = (
    <FormattedMessage
      id="preload-overlay.load-button"
      defaultMessage="Load Room"
    />
  )
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
          alt={intl.formatMessage({
            id: 'preload-overlay.logo-alt',
            defaultMessage: 'Logo',
          })}
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
  )
}
