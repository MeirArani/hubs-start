import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';
import { Pathfinding } from 'three-pathfinding';

export interface UseNavMeshProps {
  mesh: Mesh;
  zone: string;
}

// export default function useNavMesh({ mesh, zone }: UseNavMeshProps) {

// }
