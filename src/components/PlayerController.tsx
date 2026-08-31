import {
  useAcceleration,
  useDrag as useDrag,
  useMouse,
} from '#/input/UserInput.client.tsx';
import {
  act,
  startTransition,
  useContext,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  Color,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera as PerspectiveCameraThree,
  Quaternion,
  TorusGeometry,
  Vector3,
} from 'three';
import {
  calculateCameraTransformForWaypoint,
  childMatch,
  rotateInPlaceAroundWorldUp,
} from '#/utils/three-utils';
import { SceneContext } from '#/core/Scene';
import type { Node } from 'three-pathfinding';
import Cursor from './Cursor';
import { PerspectiveCamera, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import Teleporter, { HitEntity } from './Teleporter';
import { RayCurve } from '#/utils/RayCurve';
import { isMobile } from '#/utils/is-mobile.client';

interface Waypoint {
  transform: Matrix4;
  isInstant: boolean;
  willDisableMotion: boolean;
  willDisableTeleporting: boolean;
  snapToNavMesh: boolean;
  willMaintainInitialOrientation: boolean;
}

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
  obj.parent?.updateMatrixWorld(true);
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
    obj.updateMatrixWorld(true);
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
const rig = new Vector3();
const head = new Vector3();
const deltaFromHeadToTargetForHead = new Vector3();
const targetForHead = new Vector3();
const targetForRig = new Vector3();

// travelByWaypoint
const inMat4Copy = new Matrix4();
const inPosition = new Vector3();
const outPosition = new Vector3();
const translation = new Matrix4();
const initialOrientation = new Matrix4();
const finalScale = new Vector3();
const finalPosition = new Vector3();
const finalPOV = new Matrix4();
const startTransform = new Matrix4();
const startTranslation = new Matrix4();

export interface PlayerControllerProps {}
export default function PlayerController({}: PlayerControllerProps) {
  const avatarPOV = useRef<PerspectiveCameraThree>(null);
  const [teleporting, setTeleporting] = useState(false);
  const avatarRig = useRef<Object3D>(null);
  const wasFlying = useRef(false);
  const navGroup = useRef<number>(-1);
  const navNode = useRef<Node>(null);
  const fly = useRef(false);
  const shouldLandWhenPossible = useRef(false);
  const shouldOccupyWaypointsOnceMoving = useRef(false);
  const didTeleportSinceLastWaypointTravel = useRef(false);
  const waypoints = useRef<Waypoint[]>([]);
  const activeWaypoint = useRef<Waypoint>(null);
  const isMotionDisabled = useRef(false);
  const isTeleportingDisabled = useRef(false);
  const waypointTravelTime = useRef(0);
  const waypointTravelStartTime = useRef(0);

  const rayCurve = useRef<RayCurve>(null);
  const hitRef = useRef<Group>(null);
  const outerHitTorus = useRef<Mesh<TorusGeometry, MeshBasicMaterial>>(null);
  const outerHit = useRef<Mesh<TorusGeometry, MeshBasicMaterial>>(null);

  const scene = useContext(SceneContext);

  function getCurrentPlayerHeight() {
    return 1.6;
  }

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

  function travelByWaypoint(
    inMat4: Matrix4,
    snapToNavMesh: boolean,
    willMaintainInitialOrientation: boolean,
  ) {
    if (!avatarPOV.current) return;
    if (!avatarRig.current) return;
    avatarPOV.current.updateMatrixWorld(true);
    if (!fly.current && !snapToNavMesh) {
      fly.current = true;
      shouldLandWhenPossible.current = true;
    }

    shouldOccupyWaypointsOnceMoving.current = true;
    didTeleportSinceLastWaypointTravel.current = false;
    inMat4Copy.copy(inMat4);
    rotateInPlaceAroundWorldUp(inMat4Copy, Math.PI, finalPOV);
    const navMeshExists = scene.nav && NavZone in scene.nav?.pathfinder.zones;
    if (!navMeshExists && snapToNavMesh) {
      console.warn(
        'Tried to travel to a waypoint that wants to snap to the nav mesh, but there is no nav mesh',
      );
    }
    if (navMeshExists && snapToNavMesh) {
      inPosition.setFromMatrixPosition(inMat4Copy);
      findPositionOnNavMesh(inPosition, inPosition, outPosition, true);
      finalPOV.setPosition(outPosition);
      translation.makeTranslation(0, 1.6, -0.15);
    } else {
      // If we are not snapping to the nav mesh, align the user's
      // perspective exactly to the robot eyes as they appear in the
      // waypoint indicator. (1.6 meters up and 0.15 meters forward)
      // This does _not_ require taking the player's height into account
      // on this line because we are only interested in where the
      // camera will end up.
      translation.makeTranslation(0, 1.6, -0.15);
    }
    finalPOV.multiply(translation);
    if (willMaintainInitialOrientation) {
      initialOrientation.extractRotation(avatarPOV.current.matrixWorld);
      finalScale.setFromMatrixScale(finalPOV);
      finalPOV
        .copy(initialOrientation)
        .scale(finalScale)
        .setPosition(finalPosition);
    }
    calculateCameraTransformForWaypoint(
      avatarPOV.current.matrixWorld,
      finalPOV,
      finalPOV,
    );
    childMatch(avatarRig.current, avatarPOV.current, finalPOV);
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
    if (!avatarPOV.current) return;
    if (!avatarRig.current) return;

    if (accel.x === 0 && accel.y === 0) return;

    const didStopFlying = wasFlying.current && !fly.current;

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
    avatarPOV.current?.updateMatrixWorld(true);
    rotateInPlaceAroundWorldUp(
      avatarPOV.current.matrixWorld,
      0,
      snapRotatedPOV,
    );
    newPOV.copy(snapRotatedPOV);

    //@ts-ignore
    const navMeshExists = NavZone in scene.nav?.pathfinder.zones;

    const triedToMove = relativeMotion.lengthSq() > 0.000001;
    if (triedToMove) {
      calculateDisplacementToDesiredPOV(
        avatarPOV.current.matrixWorld,
        fly.current || !navMeshExists,
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
        startPOVPosition.setFromMatrixPosition(avatarPOV.current.matrixWorld),
        desiredPOVPosition.setFromMatrixPosition(newPOV),
        navMeshSnappedPOVPosition,
        shouldRecomputeNavGroupAndNavNode,
      );

      squareDistNavMeshCorrection = desiredPOVPosition.distanceToSquared(
        navMeshSnappedPOVPosition,
      );

      if (fly.current && squareDistNavMeshCorrection < 0.5) {
        fly.current = false;
        newPOV.setPosition(navMeshSnappedPOVPosition);
      } else if (!fly.current) {
        newPOV.setPosition(navMeshSnappedPOVPosition);
      }
    }

    // Match Parent to child movement
    childMatch(avatarRig.current, avatarPOV.current, newPOV);

    relativeMotion.copy(nextRelativeMotion);
  });

  // CameraLook
  useDrag((mouse, delta) => {
    if (!avatarRig.current) return;
    if (
      Math.abs(mouse.delta.x) < MouseEpsilon &&
      Math.abs(mouse.delta.y) < MouseEpsilon
    )
      return;

    rotatePitchAndYaw(
      avatarRig.current,
      -mouse.delta.y * CameraSpeed * delta,
      -mouse.delta.x * CameraSpeed * delta,
    );
  });

  useMouse((mouse, state, delta) => {
    if (!mouse.buttons.right && teleporting) {
      setTeleporting(false);
      return;
    }
    if (mouse.buttons.right && !teleporting) {
      setTeleporting(true);
    }
  });

  useFrame((state, delta) => {
    if (!avatarPOV.current) return;
    if (!avatarRig.current) return;
    if (waypoints.current.length < 1 && !activeWaypoint.current) return;
    const waypoint = waypoints.current.splice(0, 1)[0];
    activeWaypoint.current = waypoint;
    isMotionDisabled.current =
      waypoint.willDisableMotion &&
      (!isMobile() || waypoint.willDisableTeleporting);
    avatarPOV.current.updateMatrixWorld(true);

    // TODO: Logic for non-instant waypoints
    rotateInPlaceAroundWorldUp(
      avatarPOV.current.matrixWorld,
      Math.PI,
      startTransform,
    );
    startTransform.multiply(
      startTranslation.makeTranslation(0, -1 * getCurrentPlayerHeight(), -0.15),
    );
    waypointTravelStartTime.current = state.clock.elapsedTime;
    if (waypointTravelTime.current > 100) {
      // Play cool SFX
    }

    // TODO: Again deal with logic for non-instant waypoints
    travelByWaypoint(
      waypoint.transform,
      waypoint.snapToNavMesh,
      waypoint.willMaintainInitialOrientation,
    );
    // TODO: Consider Matrix4 pooling
    activeWaypoint.current = null;
    if (waypointTravelTime.current > 0) {
      // Play exit SFX
    }

    // Handle flying logic
  });

  return (
    <>
      <mesh ref={avatarRig} position={[0, 0, 5]}>
        <PerspectiveCamera makeDefault position={[0, 1.6, 0]} ref={avatarPOV}>
          {teleporting && (
            <Teleporter
              teleportTo={(targetPosition: Vector3) => {
                if (!avatarRig.current) return;
                if (!avatarPOV.current) return;

                avatarRig.current?.getWorldPosition(rig);
                avatarPOV.current?.getWorldPosition(head);
                targetForHead.copy(targetPosition);

                targetForHead.y += avatarPOV.current.position.y;
                deltaFromHeadToTargetForHead.copy(targetForHead).sub(head);
                targetForRig.copy(rig).add(deltaFromHeadToTargetForHead);

                const navMeshExists = scene.nav
                  ? NavZone in scene.nav?.pathfinder.zones
                  : false;

                findPositionOnNavMesh(
                  targetForRig,
                  targetForRig,
                  avatarRig.current?.position,
                  navMeshExists,
                );
                avatarRig.current.matrixNeedsUpdate = true;
              }}
            />
          )}
        </PerspectiveCamera>

        <boxGeometry />
        <meshBasicMaterial color={'blue'} />
      </mesh>
      <Cursor />
    </>
  );
}
