import { useContext, useEffect, useRef, type RefObject } from 'react';
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber';
import { cylinderTextureSrc } from '#/utils/cylinder-texture';
import {
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Raycaster,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { SceneContext } from '#/core/Scene';
import { RayCurve } from '#/utils/RayCurve';

extend({ RayCurve });

function easeIn(t: number) {
  return t * t;
}

function easeOutIn(t: number) {
  if (t < 0.5) return 0.5 * ((t = t * 2 - 1) * t * t + 1);
  return 0.5 * (t = t * 2 - 1) * t * t + 0.5;
}

function parabolicCurve(p0: Vector3, v0: Vector3, t: number, out: Vector3) {
  out.x = p0.x + v0.x * t;
  out.y = p0.y + v0.y * t - 4.9 * t * t;
  out.z = p0.z + v0.z * t;
  return out;
}

function isValidNormalsAngle(
  collisionNormal: Vector3,
  referenceNormal: Vector3,
  landingMaxAngle: number,
) {
  const angleNormals = referenceNormal.angleTo(collisionNormal);
  return MathUtils.RAD2DEG * angleNormals <= landingMaxAngle;
}

const direction = new Vector3();
function checkLineIntersection(
  start: Vector3,
  end: Vector3,
  meshes: Object3D,
  raycaster: Raycaster,
  referenceNormal: Vector3,
  landingMaxAngle: number,
  hitPoint: Vector3,
) {
  direction.copy(end).sub(start);
  const distance = direction.length();
  raycaster.far = distance;
  raycaster.set(start, direction.normalize());
  const intersects = raycaster.intersectObject(meshes, true);
  if (
    intersects.length > 0 &&
    intersects[0].face?.normal &&
    isValidNormalsAngle(
      intersects[0].face?.normal,
      referenceNormal,
      landingMaxAngle,
    )
  ) {
    hitPoint.copy(intersects[0].point);
    return true;
  }
  return false;
}

const MissOpacity = 0.1;
const HitOpacity = 0.3;
const MissColor = new Color(0xff0000);
const HitColor = new Color(0x99ff99);
const Forward = new Vector3(0, 0, -1);
const LandingNormal = new Vector3(0, 1, 0);
const MaxLandingAngle = 45;
const DrawTime = 0.4;
const q = new Quaternion();
const vecHelper = new Vector3();
export interface TeleporterProps {
  color?: Color;
  radius?: number;
  outerRadius?: number;
  height?: number;
  teleportTo: (hitPoint: Vector3) => void;
  playerScale?: number;
  numRayCurvePoints?: number;
  teleporting?: RefObject<boolean>;
}

export default function Teleporter({
  teleporting = false,
  color = new Color('#99ff99'),
  radius = 0.25,
  outerRadius = 0.6,
  height = 0.3,
  playerScale = 1,
  numRayCurvePoints = 20,
  teleportTo,
}: TeleporterProps) {
  const mainRef = useRef<Object3D>(null);
  const rayCurveRef = useRef<RayCurve>(null);
  const hitEntityRef = useRef<Group>(null);
  const outerTorusRef = useRef<Mesh<TorusGeometry, MeshBasicMaterial>>(null);
  const torusRef = useRef<Mesh<TorusGeometry, MeshBasicMaterial>>(null);
  const cylinderRef = useRef<Mesh<CylinderGeometry, MeshBasicMaterial>>(null);

  const teleportingSound = useRef(null);
  let timeTeleporting = 0;
  const parabola = Array.from(
    new Array(numRayCurvePoints),
    () => new Vector3(),
  );
  let hit = false;
  const p0 = new Vector3();
  const v0 = new Vector3();
  const speed = 12;
  const raycaster = new Raycaster();
  const hitPoint = new Vector3();

  const scene = useContext(SceneContext);
  const state = useThree();

  useEffect(() => {
    if (!rayCurveRef.current) return;

    rayCurveRef.current.material.opacity = MissOpacity;
    rayCurveRef.current.material.color.set(MissColor);
    rayCurveRef.current.material.needsUpdate = true;
    return () => {
      teleportingSound.current = null;

      if (!hit || timeTeleporting < DrawTime) return;
      // Teleport function
      teleportTo(hitPoint);

      // Play SFX
    };
  }, []);

  useFrame((_state, delta) => {
    if (!rayCurveRef.current) return;
    if (!mainRef.current) return;
    if (!hitEntityRef.current) return;
    if (!outerTorusRef.current) return;
    if (!torusRef.current) return;

    timeTeleporting += delta;
    mainRef.current.updateMatrixWorld();
    mainRef.current.matrixWorld.decompose(p0, q, vecHelper);
    direction.copy(Forward).applyQuaternion(q).normalize();
    rayCurveRef.current.setDirection(direction);
    // CHECK: That UpdateMatricies function
    mainRef.current.updateMatrixWorld(true);
    v0.copy(direction).multiplyScalar(speed * Math.sqrt(playerScale));

    let collidedIndex = numRayCurvePoints - 1;
    hit = false;
    parabola[0].copy(p0);
    const timeSegment = 1 / (numRayCurvePoints - 1);
    const navMesh = scene.nav?.mesh;
    for (let i = 1; i < numRayCurvePoints; i++) {
      const t = i * timeSegment;
      parabolicCurve(p0, v0, t, vecHelper);
      parabola[i].copy(vecHelper);
      if (navMesh) {
        const visible = navMesh.visible;
        navMesh.visible = true;
        const result = checkLineIntersection(
          parabola[i - 1],
          parabola[i],
          navMesh,
          raycaster,
          LandingNormal,
          MaxLandingAngle,
          hitPoint,
        );
        navMesh.visible = visible;
        if (result) {
          hit = true;
          collidedIndex = i;
          break;
        }
      }
    }
    const percentToDraw =
      timeTeleporting > DrawTime ? 1 : timeTeleporting / DrawTime;
    const percentRaycasted = collidedIndex / (numRayCurvePoints - 1);
    const segmentT =
      (percentToDraw * percentRaycasted) / (numRayCurvePoints - 1);
    for (let i = 0; i < numRayCurvePoints; i++) {
      const t = i * segmentT;
      parabolicCurve(p0, v0, t, vecHelper);
      rayCurveRef.current.setPoint(i, vecHelper);
    }
    const color = hit ? HitColor : MissColor;
    const opacity =
      hit && timeTeleporting >= DrawTime ? HitOpacity : MissOpacity;
    rayCurveRef.current.material.color.set(color);
    rayCurveRef.current.material.opacity = opacity;
    hitEntityRef.current.visible = hit ? true : false;

    if (!hit) return;

    hitEntityRef.current.position.copy(hitPoint);
    hitEntityRef.current.matrixNeedsUpdate = true;
    const dRadii = outerRadius - radius;
    const outerScale =
      (outerRadius - easeIn(percentToDraw) * dRadii) / outerRadius;
    outerTorusRef.current.scale.set(outerScale, outerScale, 1);
    outerTorusRef.current.matrixNeedsUpdate = true;
    const hitEntityOpacity = HitOpacity * easeOutIn(percentToDraw);
    torusRef.current.material.opacity = hitEntityOpacity;
    if (cylinderRef.current?.material.opacity)
      cylinderRef.current.material.opacity = hitEntityOpacity;
  });

  return (
    <>
      <object3D ref={mainRef} position={[0.15, 0, 0]} />
      <rayCurve
        args={[numRayCurvePoints, 0.025]}
        ref={rayCurveRef}
        attach={(_parent, self) => {
          state.scene.add(self);
          return () => state.scene.remove(self);
        }}
      />
      <HitEntity
        color={color}
        height={height}
        radius={radius}
        outerRadius={outerRadius}
        ref={hitEntityRef}
        outerTorusRef={outerTorusRef}
        torusRef={torusRef}
        cylinderRef={cylinderRef}
      />
    </>
  );
}

export interface HitEntityProps {
  color: Color;
  height: number;
  outerRadius: number;
  radius: number;
  ref?: RefObject<Group | null>;
  outerTorusRef: RefObject<Mesh | null>;
  torusRef: RefObject<Mesh | null>;
  cylinderRef: RefObject<Mesh | null>;
}

export function HitEntity({
  radius,
  outerRadius,
  height,
  color,
  ref,
  outerTorusRef,
  torusRef,
  cylinderRef,
}: HitEntityProps) {
  const { scene } = useThree();
  const CylinderTexture = useLoader(TextureLoader, cylinderTextureSrc);
  return (
    <group
      ref={ref}
      attach={(_parent, self) => {
        scene?.add(self);
        return () => scene?.remove(self);
      }}
    >
      <mesh rotation-x={MathUtils.DEG2RAD * 90} ref={torusRef}>
        <torusGeometry args={[radius, 0.01, 16, 18, 360 * MathUtils.DEG2RAD]} />
        <meshBasicMaterial
          color={color}
          side={DoubleSide}
          transparent
          toneMapped={false}
          depthTest={false}
        />
      </mesh>
      <mesh
        position-y={height / 2}
        rotation-z={CylinderTexture.flipY ? 0 : 180 * MathUtils.DEG2RAD}
        ref={cylinderRef}
      >
        <cylinderGeometry args={[radius, radius, radius, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          side={DoubleSide}
          map={CylinderTexture}
          toneMapped={false}
          transparent
          depthTest={false}
        />
      </mesh>
      <mesh rotation-x={90 * MathUtils.DEG2RAD} ref={outerTorusRef}>
        <torusGeometry
          args={[outerRadius, 0.01, 16, 18, 360 * MathUtils.DEG2RAD]}
        />
        <meshBasicMaterial
          color={color}
          side={DoubleSide}
          opacity={HitOpacity}
          transparent
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
