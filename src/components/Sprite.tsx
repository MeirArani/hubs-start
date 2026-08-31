import { useSpriteLoader } from '@react-three/drei';
import type { ThreeElement, ThreeElements } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Sprite as ThreeSprite } from 'three';

type BaseSprite = ThreeElements['sprite'];

export interface SpriteProps extends BaseSprite {
  name?: string;
  ref?: RefObject<ThreeSprite | null>;
}

type SpriteKind = 'notice' | 'action';

export default function Sprite({ name, ref, ...rest }: SpriteProps) {
  const spriteType = name ? 'notice' : 'action';

  const { spriteObj } = useSpriteLoader(
    '/images/sprites/notice/spawn-point.png',
  );

  return (
    <sprite ref={ref} {...rest}>
      <spriteMaterial map={spriteObj?.spriteTexture} />
    </sprite>
  );
}
