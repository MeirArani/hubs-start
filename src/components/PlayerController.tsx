import {
  useAcceleration,
  useDrag as useDrag,
} from '#/input/UserInput.client.tsx';
import { useContext, useRef, type RefObject } from 'react';
import {
  Matrix4,
  Object3D,
  PerspectiveCamera as PerspectiveCameraThree,
  Quaternion,
  Vector3,
} from 'three';
import { childMatch, rotateInPlaceAroundWorldUp } from '#/utils/three-utils';
import { SceneContext } from '#/core/Scene';
import type { Node } from 'three-pathfinding';
import Cursor from './Cursor';
import { PerspectiveCamera, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// TODO: Add flying/Waypoints/VR
// TODO: Improve logic flow and react-ness

// CHECK can these exist outside the function? (Multithreading etc)
const opq = new Quaternion();
const owq = new Quaternion();
const oq = new Quaternion();
const pq = new Quaternion();
const yq = new Quaternion();
const q = new Quaternion();
const right = new Vector3();
const v = new Vector3();
const UP = new Vector3(0, 1, 0);

function rotatePitchAndYaw(obj: Object3D, pitch: number, yaw: number) {
  obj.parent?.updateMatrix();
  obj.updateMatrix();
  obj.parent?.getWorldQuaternion(opq);
  obj.getWorldQuaternion(owq);
  oq.copy(obj.quaternion);
  v.set(0, 1, 0).applyQuaternion(oq);
  const initialUpDot = v.dot(UP);
  v.set(0, 0, 1).applyQuaternion(oq);
  const initialForwardDotUp = Math.abs(v.dot(UP));
  right.set(1, 0, 0).applyQuaternion(owq);
  pq.setFromAxisAngle(right, pitch);
  yq.setFromAxisAngle(UP, yaw);

  q.copy(owq).premultiply(pq).premultiply(yq).premultiply(opq.invert());
  v.set(0, 1, 0).applyQuaternion(q);
  const newUpDot = v.dot(UP);
  v.set(0, 0, 1).applyQuaternion(q);
  const newForwardDotUp = Math.abs(v.dot(UP));
  // Ensure our pitch is in an accepted range and our head would not be flipped upside down
  if (
    (newForwardDotUp > 0.9 && newForwardDotUp > initialForwardDotUp) ||
    (newUpDot < 0 && newUpDot < initialUpDot)
  ) {
    // TODO: Apply a partial rotation that does not exceed the bounds for nicer UX
    return;
  } else {
    obj.quaternion.copy(q);
    obj.matrixNeedsUpdate = true;
    obj.updateMatrix();
  }
}

const translationCoordinateSpace = new Matrix4();
const translated = new Matrix4();
const localTranslation = new Matrix4();
function calculateDisplacementToDesiredPOV(
  povMat4: Matrix4,
  allowVerticalMovement: boolean,
  localDisplacement: Vector3,
  displacementToDesiredPOV: Vector3,
) {
  localTranslation.makeTranslation(
    localDisplacement.x,
    localDisplacement.y,
    localDisplacement.z,
  );
  translationCoordinateSpace.extractRotation(povMat4);
  if (!allowVerticalMovement) {
    // affixToWorldUp(translationCoordinateSpace, translationCoordinateSpace);
  }
  translated.copy(translationCoordinateSpace).multiply(localTranslation);
  return displacementToDesiredPOV.setFromMatrixPosition(translated);
}

const NavZone = 'character';
const MoveSpeed = 8;
const CameraSpeed = 0.05;
const MouseEpsilon = 2;
const relativeMotion = new Vector3(0, 0, 0);
const nextRelativeMotion = new Vector3(0, 0, 0);
const lerpC = 0.85;
const snapRotatedPOV = new Matrix4();
const displacementToDesiredPOV = new Vector3();
const newPOV = new Matrix4();
const startPOVPosition = new Vector3();
const desiredPOVPosition = new Vector3();
const navMeshSnappedPOVPosition = new Vector3();

export interface PlayerControllerProps {
  fly?: boolean;
  camRef: RefObject<PerspectiveCameraThree | null>;
}
export default function PlayerController({
  fly = false,
  camRef,
}: PlayerControllerProps) {
  const avatarPOV = useRef<PerspectiveCameraThree>(null);
  const avatarRig = useRef<Object3D>(null);
  const wasFlying = useRef(false);
  const navGroup = useRef<number>(-1);
  const navNode = useRef<Node>(null);

  const scene = useContext(SceneContext);

  function getClosestNode(pos: Vector3) {
    if (!scene.nav) return null;
    if (!scene.nav.pathfinder.zones[NavZone].groups[navGroup.current])
      return null;

    return (
      scene.nav.pathfinder.getClosestNode(
        pos,
        NavZone,
        navGroup.current,
        true,
      ) || scene.nav.pathfinder.getClosestNode(pos, NavZone, navGroup.current)
    );
  }

  function findPositionOnNavMesh(
    start: Vector3,
    end: Vector3,
    outPos: Vector3,
    shouldRecomputeGroupAndNode: boolean,
  ) {
    if (!scene.nav) return;
    if (!(NavZone in scene.nav.pathfinder.zones)) return;
    navGroup.current =
      shouldRecomputeGroupAndNode || navGroup.current === -1
        ? scene.nav.pathfinder.getGroup(NavZone, end)
        : navGroup.current;
    navNode.current =
      shouldRecomputeGroupAndNode ||
      navNode.current === null ||
      navNode.current === undefined
        ? getClosestNode(end)
        : navNode.current;
    if (navNode.current === null || navNode.current === undefined) {
      // navNode can be null if it has never been set or if getClosestNode fails,
      // and it can be undefined if clampStep fails, so we have to check both. We do not
      // simply check if it is falsey (!navNode), because 0 (zero) is a valid value,
      // and 0 is falsey.
      outPos.copy(end);
    } else {
      navNode.current = scene.nav.pathfinder.clampStep(
        start,
        end,
        navNode.current,
        NavZone,
        navGroup.current,
        outPos,
      );
    }
    return outPos;
  }

  // TODO: Here we assume the player is standing straight up, but in VR it is often the case
  // that you want to lean over the edge of a balcony/table that does not have nav mesh below.
  // We should find way to allow leaning over the edge of a balcony and maybe disallow putting
  // your head through a wall.
  const startingFeetPosition = new Vector3();
  const desiredFeetPosition = new Vector3();
  function findPOVPositionAboveNavMesh(
    startPOVPosition: Vector3,
    desiredPOVPosition: Vector3,
    outPOVPosition: Vector3,
    shouldRecomputeGroupAndNode: boolean,
  ) {
    // TODO: Fix
    // const playerHeight = getCurrentPlayerHeight(true);
    const playerHeight = 1.6;
    startingFeetPosition.copy(startPOVPosition);
    startingFeetPosition.y -= playerHeight;
    desiredFeetPosition.copy(desiredPOVPosition);
    desiredFeetPosition.y -= playerHeight;
    findPositionOnNavMesh(
      startingFeetPosition,
      desiredFeetPosition,
      outPOVPosition,
      shouldRecomputeGroupAndNode,
    );
    outPOVPosition.y += playerHeight;
    return outPOVPosition;
  }

  // Calculate Movement
  useAcceleration((accel, delta) => {
    if (!camRef.current) return;
    if (!avatarRig.current) return;

    if (accel.x === 0 && accel.y === 0) return;

    const didStopFlying = wasFlying.current && !fly;

    accel.multiplyScalar(delta);

    // Calculate new movement (relative) motion
    const zAccel = -1 * accel.y;
    relativeMotion.set(
      relativeMotion.x + accel.x,
      relativeMotion.y,
      relativeMotion.z + zAccel,
    );
    nextRelativeMotion.copy(relativeMotion).multiplyScalar(lerpC);
    relativeMotion.multiplyScalar(1 - lerpC);

    // Rotate player and place in correct position
    camRef.current?.updateMatrix();
    rotateInPlaceAroundWorldUp(camRef.current.matrixWorld, 0, snapRotatedPOV);
    newPOV.copy(snapRotatedPOV);

    //@ts-ignore
    const navMeshExists = NavZone in scene.nav?.pathfinder.zones;

    const triedToMove = relativeMotion.lengthSq() > 0.000001;
    if (triedToMove) {
      calculateDisplacementToDesiredPOV(
        camRef.current.matrixWorld,
        fly || !navMeshExists,
        relativeMotion.multiplyScalar(MoveSpeed),
        displacementToDesiredPOV,
      );
      // Translate POV to new (rotated) position
      newPOV
        .makeTranslation(
          displacementToDesiredPOV.x,
          displacementToDesiredPOV.y,
          displacementToDesiredPOV.z,
        )
        .multiply(snapRotatedPOV);
    }

    const shouldRecomputeNavGroupAndNavNode = didStopFlying;
    const shouldResnapToMesh =
      navMeshExists && (shouldRecomputeNavGroupAndNavNode || triedToMove);

    let squareDistNavMeshCorrection = 0;
    if (shouldResnapToMesh) {
      findPOVPositionAboveNavMesh(
        startPOVPosition.setFromMatrixPosition(camRef.current.matrixWorld),
        desiredPOVPosition.setFromMatrixPosition(newPOV),
        navMeshSnappedPOVPosition,
        shouldRecomputeNavGroupAndNavNode,
      );

      squareDistNavMeshCorrection = desiredPOVPosition.distanceToSquared(
        navMeshSnappedPOVPosition,
      );

      if (fly && squareDistNavMeshCorrection < 0.5) {
        fly = false;
        newPOV.setPosition(navMeshSnappedPOVPosition);
      } else if (!fly) {
        newPOV.setPosition(navMeshSnappedPOVPosition);
      }
    }

    // Match Parent to child movement
    childMatch(avatarRig.current, camRef.current, newPOV);

    relativeMotion.copy(nextRelativeMotion);
  });

  // CameraLook
  useDrag((mouse, delta) => {
    if (!camRef.current) return;
    if (
      Math.abs(mouse.delta.x) < MouseEpsilon &&
      Math.abs(mouse.delta.y) < MouseEpsilon
    )
      return;

    rotatePitchAndYaw(
      camRef.current,
      mouse.delta.y * CameraSpeed * delta,
      mouse.delta.x * CameraSpeed * delta,
    );
  });

  return (
    <>
      <mesh ref={avatarRig}>
        <PerspectiveCamera makeDefault ref={camRef} />
        <boxGeometry />
      </mesh>
      <Cursor camera={camRef} />
    </>
  );
}
