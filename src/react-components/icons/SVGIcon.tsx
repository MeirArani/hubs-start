import type { FunctionComponent, ReactNode, SVGProps } from 'react';

export type SVG = FunctionComponent<
  SVGProps<SVGSVGElement> & {
    title?: string;
    titleId?: string;
    desc?: string;
    descId?: string;
  }
>;
export default function SVGIcon({
  SVG,
  className,
}: {
  SVG: SVG;
  className?: string;
}) {
  return (
    <>
      <SVG className={`${className}`} />
    </>
  );
}
