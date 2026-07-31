import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import MoreIcon from '../icons/More.svg?react';
import Popover from '../popover/Popover';
import ToolbarButton from '../input/ToolbarButton';
import { m } from '#/paraglide/messages';
import type { SVG } from '../icons/SVGIcon';

interface MoreMenuItem {
  href?: string;
  target?: string;
  icon: SVG;
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

  const Row = (
    <>
      <Icon />
      <span>{item.label}</span>
    </>
  );

  const styles = {
    main: 'flex items-center w-full h-10 py-0 px-4 text-text-primary text-sm font-medium *:mr-4 *:last:mr-0 [&>svg]:text-text-primary lg:w-[calc(100%_+_2px)]',
    hover:
      'hover:-ml-px hover:-mr-px hover:px-4.25  hover:text-active-text hover:bg-active-hover hover:[&>svg]:text-active-text',
    active:
      'active:-ml-px active:-mr-px active:px-4.25 active:bg-active-pressed active:[&>svg]:**:text-active-text active:[&>svg]:**:fill-active-text',
    focusWithin:
      'focus-within:-ml-px focus-within:-mr-px focus-within:px-4.25 focus-within:text-active-text focus-within:font-bold focus-within:[&>svg]:**:stroke-active-text focus-within:[&>svg]:**:fill-active-text focus-within:bg-active-hover focus-within:shadow-[inset_0_0_0_3px_var(--color-outline)]',
  } as const;

  return (
    <li onClick={closePopover}>
      {item.href ? (
        <a
          className={`${styles['main']} ${styles['hover']} ${styles['active']} ${styles['focusWithin']} active:bg-active-pressed`}
          href={item.href}
          target={item.target || '_blank'}
          rel="noopener noreferrer"
        >
          {Row}
        </a>
      ) : (
        <button
          className={`${styles['main']}  ${styles['hover']} ${styles['active']} ${styles['focusWithin']} bg-transparent border-none`}
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
      <h1 className="ml-4 text-xs font-bold text-text-tertiary">
        {group.label}
      </h1>
      <ul className="pt-1 pb-4">
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
    <div className="min-w-60 pt-4 lg:pt-0">
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

interface MoreMenuPopoverButtonProps {
  menu: (MoreMenuGroup & { id: string })[];
}

export function MoreMenuPopoverButton({ menu }: MoreMenuPopoverButtonProps) {
  const [visible, setVisible] = useContext(MoreMenuContext);
  //const title = intl.formatMessage(moreMenuTitle);
  const title = m['more-menu-popover.title']();

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
          icon={MoreIcon}
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
  // const intl = useIntl();
  const [, setVisible] = useContext(MoreMenuContext);

  return (
    <button
      className={`pointer-events-none absolute top-2 left-2 w-12 h-12 rounded-[48px] text-button-text bg-button border border-button-border flex items-center justify-center hover:bg-button-hover active:bg-button-pressed [&>svg]:text-text-primary lg:hidden ${className}`}
      // aria-label={intl.formatMessage(moreMenuTitle)}
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
