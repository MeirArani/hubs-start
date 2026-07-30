import { useCallback, useRef } from 'react';
import LevelBar from './LevelBar';

export type VolumeType = 'mic' | 'mixer';

export interface VolumeLevelBarProps {
  type?: VolumeType;
  className?: string;
}

export default function VolumeLevelBar({
  type = 'mic',
  className,
}: VolumeLevelBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  const updateBar = useCallback((level: number) => {
    if (!ref.current) return;
    const node = ref.current;
    const pct = level * 100;
    if (node.clientWidth > node.clientHeight) {
      node.style.clipPath = `polygon(0% 100%, ${pct}% 100%, ${pct}% 0%, 0% 0%)`;
      return;
    }
    node.style.clipPath = `polygon(0% 100%, 100% 100%, 100% ${100 - pct}%, 0% ${100 - pct}%)`;
  }, []);

  //REIMP
  //   useVolumeMeter({
  //     analyser:
  //       type === 'mic'
  //         ? scene.systems['hubs-systems'].audioSystem.outboundAnalyser
  //         : scene.systems['hubs-systems'].audioSystem.mixerAnalyser,
  //     updateBar,
  //   });

  return <LevelBar ref={ref} className={`${className}`} />;
}
