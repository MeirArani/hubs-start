import type { RefObject } from 'react';

export interface LevelBarProps {
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
}

export default function LevelBar({ className, ref }: LevelBarProps) {
  return (
    <div className={`relative flex ${className}`}>
      <div className="relative w-full border border-lightgrey rounded-sm z-1" />
      <div
        ref={ref}
        className="absolute w-[calc(100%-8px)] h-[calc(100%-8px)] bg-green ml-1 mt-1 -z-1"
      />
    </div>
  );
}
