import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { defineMessage, useIntl } from 'react-intl';
import MoreIcon from '../icons/More.svg?react';
import Popover from '../popover/Popover';
import ToolbarButton from '../input/ToolbarButton';

interface MoreMenuItem {
  href?: string;
  target?: string;
  icon: { src?: string; alt?: string };
  label: ReactNode;
  onClick: (
    item: MoreMenuItem,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}

interface MoreMenuItemProps {
  item: MoreMenuItem;
  closePopover: () => void;
}

function MoreMenuItem({ item, closePopover }: MoreMenuItemProps) {
  const Icon = item.icon;
  const imageAlt =
    Icon?.alt &&
    defineMessage({
      id: '{label}.{alt}',
      defaultMessage: '{alt}',
    });
  const intl = useIntl();
  const imageAltText =
    imageAlt &&
    intl.formatMessage(imageAlt, { label: item.label, alt: Icon.alt });

  const Row = (
    <>
      {/* {Icon?.src ? <img src={Icon.src} alt={imageAltText} /> : <Icon />} */}
      <img src={Icon.src} alt={Icon.alt} />
      <span>{item.label}</span>
    </>
  );

  return (
    <li onClick={closePopover}>
      {item.href ? (
        <a
          className="more-menu-item-target"
          href={item.href}
          target={item.target || '_blank'}
          rel="noopener noreferrer"
        >
          {Row}
        </a>
      ) : (
        <button
          className="more-menu-item-target"
          onClick={(event) => item.onClick(item, event)}
        >
          {Row}
        </button>
      )}
    </li>
  );
}

interface MoreMenuGroup {
  label: string;
  items: Array<MoreMenuItem & { id: string }>;
}

interface MoreMenuGroupProps {
  group: MoreMenuGroup;
  closePopover: () => void;
}

function MoreMenuGroup({ group, closePopover }: MoreMenuGroupProps) {
  return (
    <li>
      <h1 className="more-menu-group-label">{group.label}</h1>
      <ul className="more-menu-item-list">
        {group.items.map((item) => (
          <MoreMenuItem key={item.id} item={item} closePopover={closePopover} />
        ))}
      </ul>
    </li>
  );
}

interface MoreMenuPopoverContentProps {
  menu: (MoreMenuGroup & { id: string })[];
  closePopover: () => void;
}

function MoreMenuPopoverContent({
  menu,
  closePopover,
}: MoreMenuPopoverContentProps) {
  return (
    <div className="more-menu-popover">
      <ul>
        {menu.map((group) => (
          <MoreMenuGroup
            key={group.id}
            group={group}
            closePopover={closePopover}
          />
        ))}
      </ul>
    </div>
  );
}

const MoreMenuContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => {}]);

interface MoreMenuContextProviderProps {
  initiallyVisible?: boolean;
  children?: ReactNode;
}

export function MoreMenuContextProvider({
  initiallyVisible,
  children,
}: MoreMenuContextProviderProps) {
  const context = useState(initiallyVisible || false);
  return <MoreMenuContext value={context}>{children}</MoreMenuContext>;
}

const moreMenuTitle = defineMessage({
  id: 'more-menu-popover.title',
  defaultMessage: 'More',
});

interface MoreMenuPopoverButtonProps {
  menu: (MoreMenuGroup & { id: string })[];
}

export function MoreMenuPopoverButton({ menu }: MoreMenuPopoverButtonProps) {
  const intl = useIntl();
  const [visible, setVisible] = useContext(MoreMenuContext);
  const title = intl.formatMessage(moreMenuTitle);

  return (
    <Popover
      title={title}
      content={(props) => <MoreMenuPopoverContent menu={menu} {...props} />}
      placement="top-end"
      offsetDistance={28}
      isVisible={visible}
      onChangeVisible={setVisible}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <ToolbarButton
          ref={triggerRef}
          icon={<MoreIcon />}
          selected={popoverVisible}
          onClick={togglePopover}
          label={title}
        />
      )}
    </Popover>
  );
}

// The CompactMoreMenuButton is only shown in the small breakpoint.
// We actually render the popover in the MoreMenuPopoverButton so that when resizing the window,
// the popover positions itself relative to the correct element.
export function CompactMoreMenuButton({
  className,
  ...rest
}: {
  className?: string;
}) {
  const intl = useIntl();
  const [, setVisible] = useContext(MoreMenuContext);

  return (
    <button
      className={`compact-button ${className}`}
      aria-label={intl.formatMessage(moreMenuTitle)}
      onClick={(e) => {
        // Stop event bubbling so we don't immediately close the popover by clicking outside it.
        e.stopPropagation();
        setVisible(true);
      }}
      {...rest}
    >
      <MoreIcon />
    </button>
  );
}
