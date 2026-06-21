import {
  cloneElement,
  createContext,
  type MouseEventHandler,
  type ReactElement,
} from 'react'

export const ReactAudioContext = createContext<{
  playSound?: (sound: string) => void
}>({})

export const hudHoverSound = 'play_sound-hud_hover_start'

export function WithHoverSound({
  sound,
  children,
}: {
  sound?: string
  children: ReactElement<{ onMouseEnter?: MouseEventHandler }>
}) {
  return (
    <ReactAudioContext.Consumer>
      {(context) => {
        return cloneElement(children, {
          onMouseEnter: (e: React.MouseEvent) => {
            if (context && context.playSound) {
              context.playSound(sound || hudHoverSound)
            }
            children.props.onMouseEnter && children.props.onMouseEnter(e)
          },
        })
      }}
    </ReactAudioContext.Consumer>
  )
}
