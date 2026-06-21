// Via https://stackoverflow.com/a/76178335/2852735

import type { HTMLAttributes, ComponentPropsWithoutRef, JSX } from 'react'

// All valid HTML tags like 'div' | 'form' | 'a' | ...
export type ValidTags = keyof JSX.IntrinsicElements

// Generic type to generate HTML props based on its tag
export type CustomTagProps<T extends ValidTags> = {
  tag?: T | ValidTags
} & (ComponentPropsWithoutRef<T> & HTMLAttributes<HTMLOrSVGElement>)

/**
 * Make the default tag a constant to make it easy to infer both the default
 * generic parameter and the `tag` prop
 */
export const DEFAULT_TAG = 'div' as const

// Use the default `div` tag for both the generic parameter and `tag` prop
export function CustomTag<T extends ValidTags = typeof DEFAULT_TAG>({
  tag = DEFAULT_TAG,
  ...rest
}: CustomTagProps<T>): JSX.Element {
  /**
   * Assign the `tag` prop to a variable `CustomTag` of type ValidTags.
   *
   * The reason for doing this instead of rendering the `<Tag />` right away
   * is that the TypeScript compiler will yell at you with:
   * `Expression produces a union type that is too complex to represent`
   */
  const Tag: ValidTags = tag

  // Render the custom tag with its props
  return <Tag {...rest}>This is a custom {tag} tag!</Tag>
}
