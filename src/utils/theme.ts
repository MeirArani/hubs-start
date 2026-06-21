// NOTE these should be synchronized with the top of shared.scss
const DEFAULT_ACTION_COLOR = '#FF3464'
const DEFAULT_ACTION_COLOR_LIGHT = '#FF74A4'

export type Theme = {
  darkModeDefault: boolean
  id: string
  name: string
  variables: Record<string, string>
  default?: boolean
}

const DefaultColors = {
  'action-color': DEFAULT_ACTION_COLOR,
  'action-label-color': DEFAULT_ACTION_COLOR,
  'action-color-disabled': DEFAULT_ACTION_COLOR_LIGHT,
  'action-color-highlight': DEFAULT_ACTION_COLOR_LIGHT,
  'action-text-color': '#FFFFFF',
  'action-subtitle-color': '#F0F0F0',
  'notice-background-color': '#2F80ED',
  'notice-text-color': '#FFFFFF',
  'favorited-color': '#FFC000',
  'nametag-color': '#000000',
  'nametag-volume-color': '#7ED320',
  'nametag-text-color': '#FFFFFF',
  'nametag-border-color': '#7ED320',
  'nametag-border-color-raised-hand': '#FFCD74',
}

const DefaultTheme: Theme = {
  darkModeDefault: false,
  id: 'default',
  name: 'default',
  variables: DefaultColors,
  default: true,
}

const themes: Theme[] = []

export function getDarkModeQuery() {
  // window.matchMedia is not available when this module is imported in node.js,
  // which happens when using `npm run login` for Hubs Cloud customization.
  // So we return a dummy MediaQueryList instead.
  if (typeof window.matchMedia !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)')
  }
  return {
    matches: false,
    addEventListener: (
      type: 'change',
      listener: (e: MediaQueryListEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ) => {},
    removeEventListener: (
      type: 'change',
      listener: (e: MediaQueryListEvent) => void,
      options?: boolean | EventListenerOptions,
    ) => {},
  }
}

export function registerDarkModeQuery(
  changeListener: (e: MediaQueryListEvent) => void,
) {
  const darkModeQuery = getDarkModeQuery()

  darkModeQuery.addEventListener('change', changeListener)

  const removeListener = () => {
    darkModeQuery.removeEventListener('change', changeListener)
  }

  return [darkModeQuery, removeListener] as const
}

// TODO: fix up themes and config
export function getDefaultTheme() {
  return themes.find((t) => t.default) || themes[0]
}

export function tryGetTheme(themeId: string) {
  if (!Array.isArray(themes)) return

  const theme = themeId && themes.find((t) => t.id === themeId)
  if (theme) {
    return theme
  } else {
    const darkMode = getDarkModeQuery().matches
    return (
      (darkMode && themes.find((t) => t.darkModeDefault)) || getDefaultTheme()
    )
  }
}

export function getCurrentTheme() {
  //   const preferredThemeId = StorageInstance.state?.preferences?.theme;
  //   return tryGetTheme(preferredThemeId);
  return DefaultTheme
}

// HACK: Switch keyof typeof to real type
export function getThemeColor(name: keyof typeof DefaultColors) {
  //   const theme = getCurrentTheme()
  // config?.theme?.[name] ensures legacy variables for nametag colors are taken into account
  return (
    // theme?.variables?.[name] || config?.theme?.[name] || DEFAULT_COLORS[name]
    DefaultColors[name]
  )
}

// HACK based on if check
export function updateTextButtonColors() {
  const actionColor = getThemeColor('action-color')
  const actionHoverColor = getThemeColor('action-color-highlight')

  if (document.querySelector('#rounded-text-button')) {
    // NOTE, using the object-based {} setAttribute variant in a-frame
    // seems to not work in Firefox here -- the entities with the mixins are not
    // updated.
    document
      .querySelector('#rounded-text-button')!
      .setAttribute(
        'text-button',
        `textHoverColor: ${actionHoverColor}; textColor: ${actionColor}; backgroundColor: #fff; backgroundHoverColor: #aaa;`,
      )

    document
      .querySelector('#rounded-button')!
      .setAttribute(
        'text-button',
        `textHoverColor: ${actionHoverColor}; textColor: ${actionColor}; backgroundColor: #fff; backgroundHoverColor: #aaa;`,
      )

    document
      .querySelector('#rounded-text-action-button')!
      .setAttribute(
        'text-button',
        `textHoverColor: #fff; textColor: #fff; backgroundColor: ${actionColor}; backgroundHoverColor: ${actionHoverColor}`,
      )

    document
      .querySelector('#rounded-action-button')!
      .setAttribute(
        'text-button',
        `textHoverColor: #fff; textColor: #fff; backgroundColor: ${actionColor}; backgroundHoverColor: ${actionHoverColor}`,
      )
  }
}

export function applyThemeToBody() {
  const theme = getCurrentTheme()
  document.body.setAttribute(
    'data-theme',
    theme.name.toLowerCase().includes('dark') ? 'dark' : 'light',
  )
}

export function onThemeChanged(listener: EventListener) {
  //   StorageInstance.addEventListener("themechanged", listener);
  const [_darkModeQuery, removeDarkModeListener] =
    registerDarkModeQuery(listener)

  return () => {
    // StorageInstance.removeEventListener("themechanged", listener);
    removeDarkModeListener()
  }
}

// waitForDOMContentLoaded().then(() => {
//   if (import.meta.env.NODE) {
//     // We're running in node.js, which happens when "npm run login" is used, for example,
//     // so don't bother doing anything UI related.
//     return;
//   }

//   // Set initial theme
//   const theme = getCurrentTheme();
//   if (theme && theme.name.toLowerCase().includes("dark")) {
//     document.body.setAttribute("data-theme", "dark");
//   } else {
//     document.body.setAttribute("data-theme", "light");
//   }

//   updateTextButtonColors();
//   onThemeChanged(() => {
//     updateTextButtonColors();
//     applyThemeToBody();
//   });
// });

// export function applyThemeToTextButton(el: Entity, highlighted: boolean) {
//   el.setAttribute(
//     "text-button",
//     "backgroundColor",
//     highlighted ? getThemeColor("action-color-highlight") : getThemeColor("action-color")
//   );
//   el.setAttribute(
//     "text-button",
//     "backgroundHoverColor",
//     highlighted ? "#aaa" : getThemeColor("action-color-highlight")
//   );
// }
