import type { ReactNode } from 'react';
import { joinChildren } from '../misc/joinChildren';
import IconButton, { type IconButtonProps } from '../input/IconButton';
import ChevronBackIcon from '../icons/ChevronBack.svg?react';
import LightbulbOutlineIcon from '../icons/LightbulbOutline.svg?react';
import LightbulbIcon from '../icons/Lightbulb.svg?react';
import CloseIcon from '../icons/Close.svg?react';
import ArrowBackIcon from '../icons/ArrowBack.svg?react';
import ArrowForwardIcon from '../icons/ArrowForward.svg?react';

export function ObjectMenuButton({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & IconButtonProps) {
  return (
    <IconButton
      compactSm
      className={`object-menu-button ${className}`}
      {...rest}
    />
  );
}

export interface ObjectMenuProps {
  currentObjectIndex: number;
  objectCount: number;
  children?: ReactNode;
  title?: ReactNode;
  onClose?: () => void;
  onBack?: () => void;
  onPrevObject: () => void;
  onNextObject: () => void;
  onToggleLights?: () => void;
  lightsEnabled?: boolean;
  isAvatar?: boolean;
}
export default function ObjectMenu({
  currentObjectIndex,
  objectCount,
  children,
  title,
  onClose,
  onBack,
  onPrevObject,
  onNextObject,
  onToggleLights,
  lightsEnabled,
  isAvatar,
}: ObjectMenuProps) {
  return (
    <>
      <IconButton className="back-button" onClick={onBack}>
        <ChevronBackIcon width={24} height={24} />
      </IconButton>
      <IconButton className="lights-button" onClick={onToggleLights}>
        {lightsEnabled ? (
          <LightbulbOutlineIcon
            title="Turn Lights Off"
            width={24}
            height={24}
          />
        ) : (
          <LightbulbIcon title="Turn Lights On" width={24} height={24} />
        )}
      </IconButton>
      <div className="object-menu-container">
        <div className="object-menu">
          <div className="header">
            <IconButton className="close-button" onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </IconButton>
            <h5>{title}</h5>
            <IconButton
              className="lights-header-button"
              onClick={onToggleLights}
            >
              {lightsEnabled ? (
                <LightbulbOutlineIcon
                  title="Turn Lights Off"
                  width={16}
                  height={16}
                />
              ) : (
                <LightbulbIcon title="Turn Lights On" width={16} height={16} />
              )}
            </IconButton>
          </div>
          <div className="menu">
            {joinChildren(children, () => (
              <div className="separator" />
            ))}
          </div>
        </div>
        {!isAvatar && (
          <div className="pagination">
            <IconButton onClick={onPrevObject}>
              <ArrowBackIcon width={24} height={24} />
            </IconButton>
            <p>
              {currentObjectIndex + 1}/{objectCount}
            </p>
            <IconButton onClick={onNextObject}>
              <ArrowForwardIcon width={24} height={24} />
            </IconButton>
          </div>
        )}
      </div>
    </>
  );
}
