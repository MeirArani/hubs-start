import * as THREE from 'three';
import { useRef } from 'react';
import { useGLTF, PerspectiveCamera, useAnimations } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import {
  UserInputSystem,
  inputStore,
  useInput,
} from '#/input/UserInput.client';
import { useSelector } from '@tanstack/react-store';

type GLTFResult = GLTF & {
  nodes: {
    navMesh: THREE.Mesh;
    trimesh: THREE.Mesh;
    flags001: THREE.Mesh;
    flags002: THREE.Mesh;
    flags003: THREE.Mesh;
    flags004: THREE.Mesh;
    flags005: THREE.Mesh;
    flags006: THREE.Mesh;
    flags007: THREE.Mesh;
    flags008: THREE.Mesh;
    flags010: THREE.Mesh;
    flags011: THREE.Mesh;
    tentFlags001: THREE.Mesh;
    Cube018_0: THREE.Mesh;
    Cube018_1: THREE.Mesh;
    screens: THREE.Mesh;
    biplane_prop: THREE.Mesh;
    Cylinder103_0: THREE.Mesh;
    Cylinder103_1: THREE.Mesh;
    hot_air_balloon001: THREE.Mesh;
    goose: THREE.SkinnedMesh;
    goose001: THREE.SkinnedMesh;
    goose002: THREE.SkinnedMesh;
    goose003: THREE.SkinnedMesh;
    goose004: THREE.SkinnedMesh;
    goose005: THREE.SkinnedMesh;
    goose006: THREE.SkinnedMesh;
    shadow_planes: THREE.Mesh;
    CombinedMesh: THREE.Mesh;
    wing_upperR: THREE.Bone;
    wing_upperL: THREE.Bone;
    neutral_bone: THREE.Bone;
    wing_upperR_1: THREE.Bone;
    wing_upperL_1: THREE.Bone;
    neutral_bone_1: THREE.Bone;
    wing_upperR_2: THREE.Bone;
    wing_upperL_2: THREE.Bone;
    neutral_bone_2: THREE.Bone;
    wing_upperR_3: THREE.Bone;
    wing_upperL_3: THREE.Bone;
    neutral_bone_3: THREE.Bone;
    wing_upperR_4: THREE.Bone;
    wing_upperL_4: THREE.Bone;
    neutral_bone_4: THREE.Bone;
    wing_upperR_5: THREE.Bone;
    wing_upperL_5: THREE.Bone;
    neutral_bone_5: THREE.Bone;
    wing_upperR_6: THREE.Bone;
    wing_upperL_6: THREE.Bone;
    neutral_bone_6: THREE.Bone;
  };
  materials: {
    ['SKY TEMP']: THREE.MeshBasicMaterial;
    screens: THREE.MeshBasicMaterial;
    prop: THREE.MeshStandardMaterial;
    ['signs trans']: THREE.MeshStandardMaterial;
    gradient: THREE.MeshBasicMaterial;
    shadows: THREE.MeshStandardMaterial;
    ['signs trans']: THREE.MeshStandardMaterial;
  };
};

type ActionName =
  | 'wind'
  | 'wind.001'
  | 'wind.002'
  | 'wind.003'
  | 'wind.004'
  | 'wind.005'
  | 'wind.006'
  | 'wind.007'
  | 'wind.008'
  | 'wind.009'
  | 'tentFlagWind'
  | 'spinAroundAction.001'
  | 'roll.001'
  | 'hotair'
  | 'flyover'
  | 'Action'
  | 'flap1'
  | 'flap2'
  | 'flap3'
  | 'flap4'
  | 'flap5'
  | 'flap6'
  | 'flap7';
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

// @ts-ignore
export function TestScene(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group | null>(null);
  const { nodes, materials, animations } = useGLTF(
    '/testWorld.bin',
  ) as unknown as GLTFResult;
  // @ts-ignore
  const { actions } = useAnimations<GLTFActions>(animations, group);

  const keys = useInput();
  const wPressed = useSelector(inputStore, (store) => store.keys.w);
  const aPressed = useSelector(inputStore, (store) => store.keys.a);
  const sPressed = useSelector(inputStore, (store) => store.keys.s);
  const dPressed = useSelector(inputStore, (store) => store.keys.d);
  const mousePressed = useSelector(inputStore, (store) => store.mouse.left);
  console.log(
    `\nw: ${wPressed}\na: ${aPressed}\ns: ${sPressed}\nd: ${dPressed}\nleft:${mousePressed}`,
  );
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Outdoor_Festival">
        <group name="Floor_Plan" position={[0, 0.005, 0]}>
          <mesh
            name="navMesh"
            castShadow
            receiveShadow
            geometry={nodes.navMesh.geometry}
            material={nodes.navMesh.material}
          />
          <mesh
            name="trimesh"
            castShadow
            receiveShadow
            geometry={nodes.trimesh.geometry}
            material={nodes.trimesh.material}
          />
        </group>
        <group
          name="Spawn_Point"
          position={[50.5, 0, -6.5]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <group name="FLAGS">
          <group name="outdoorFestival_flags001glb">
            <group name="Scene">
              <mesh
                name="flags001"
                castShadow
                receiveShadow
                geometry={nodes.flags001.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags001.morphTargetDictionary}
                morphTargetInfluences={nodes.flags001.morphTargetInfluences}
                position={[30.074, 3.511, -18.772]}
                rotation={[0, 0.415, 0]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags002glb">
            <group name="Scene_1">
              <mesh
                name="flags002"
                castShadow
                receiveShadow
                geometry={nodes.flags002.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags002.morphTargetDictionary}
                morphTargetInfluences={nodes.flags002.morphTargetInfluences}
                position={[9.983, 4.994, -14.792]}
                rotation={[2.666, 0.521, -2.891]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags003glb">
            <group name="Scene_2">
              <mesh
                name="flags003"
                castShadow
                receiveShadow
                geometry={nodes.flags003.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags003.morphTargetDictionary}
                morphTargetInfluences={nodes.flags003.morphTargetInfluences}
                position={[-26.114, 3.708, 9.027]}
                rotation={[1.437, 1.342, -1.423]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags004glb">
            <group name="Scene_3">
              <mesh
                name="flags004"
                castShadow
                receiveShadow
                geometry={nodes.flags004.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags004.morphTargetDictionary}
                morphTargetInfluences={nodes.flags004.morphTargetInfluences}
                position={[-16.704, 2.899, 8.854]}
                rotation={[-0.493, 1.108, 0.396]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags005glb">
            <group name="Scene_4">
              <mesh
                name="flags005"
                castShadow
                receiveShadow
                geometry={nodes.flags005.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags005.morphTargetDictionary}
                morphTargetInfluences={nodes.flags005.morphTargetInfluences}
                position={[-9.49, 5.157, -14.98]}
                rotation={[0, -0.952, 0]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags006glb">
            <group name="Scene_5">
              <mesh
                name="flags006"
                castShadow
                receiveShadow
                geometry={nodes.flags006.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags006.morphTargetDictionary}
                morphTargetInfluences={nodes.flags006.morphTargetInfluences}
                position={[10.907, 4.869, 23.094]}
                rotation={[0.53, -1.022, 0.463]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags007glb">
            <group name="Scene_6">
              <mesh
                name="flags007"
                castShadow
                receiveShadow
                geometry={nodes.flags007.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags007.morphTargetDictionary}
                morphTargetInfluences={nodes.flags007.morphTargetInfluences}
                position={[10.547, 4.748, 22.463]}
                rotation={[2.906, -0.64, 2.999]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags008glb">
            <group name="Scene_7">
              <mesh
                name="flags008"
                castShadow
                receiveShadow
                geometry={nodes.flags008.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags008.morphTargetDictionary}
                morphTargetInfluences={nodes.flags008.morphTargetInfluences}
                position={[5.039, 3.586, 9.87]}
                rotation={[1.126, 1.454, -1.123]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags010glb">
            <group name="Scene_8">
              <mesh
                name="flags010"
                castShadow
                receiveShadow
                geometry={nodes.flags010.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags010.morphTargetDictionary}
                morphTargetInfluences={nodes.flags010.morphTargetInfluences}
                position={[-26.539, 2.991, -6.319]}
                rotation={[-1.098, 1.253, 1.076]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_flags011glb">
            <group name="Scene_9">
              <mesh
                name="flags011"
                castShadow
                receiveShadow
                geometry={nodes.flags011.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.flags011.morphTargetDictionary}
                morphTargetInfluences={nodes.flags011.morphTargetInfluences}
                position={[-19.746, 2.976, -0.145]}
                rotation={[-0.531, -0.816, -0.404]}
                scale={[1, 1.15, 1]}
              />
            </group>
          </group>
          <group name="outdoorFestival_tentFlagsglb">
            <group name="Scene_10">
              <mesh
                name="tentFlags001"
                castShadow
                receiveShadow
                geometry={nodes.tentFlags001.geometry}
                material={materials.gradient}
                morphTargetDictionary={nodes.tentFlags001.morphTargetDictionary}
                morphTargetInfluences={nodes.tentFlags001.morphTargetInfluences}
                position={[-0.652, 1, 14.787]}
                scale={[2.5, 1, 1]}
              />
            </group>
          </group>
        </group>
        <group name="MEDIA_FRAMES">
          <group
            name="Jumbotron1"
            position={[-7.901, 3.833, -15.095]}
            rotation={[0, 0.258, 0]}
          />
          <group
            name="Jumbotron2"
            position={[7.901, 3.833, -15.095]}
            rotation={[0, -0.258, 0]}
          />
          <group
            name="Jumbotron3"
            position={[-4.026, 2.179, -25.607]}
            rotation={[-Math.PI, 0.785, -Math.PI]}
          />
        </group>
        <group name="MESHES">
          <group name="outdoorFestival_Main_combinedglb">
            <group name="Scene_11">
              <group
                name="SceneMainMesh"
                position={[33.762, 0, -23.937]}
                rotation={[-Math.PI, 1.396, -Math.PI]}
              >
                <mesh
                  name="Cube018_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Cube018_0.geometry}
                  material={materials.gradient}
                />
                <mesh
                  name="Cube018_1"
                  castShadow
                  receiveShadow
                  geometry={nodes.Cube018_1.geometry}
                  material={materials['SKY TEMP']}
                />
              </group>
              <PerspectiveCamera
                name="Jumbotron_Camera"
                makeDefault={false}
                far={1000}
                near={0.1}
                fov={1.899}
                position={[-1.862, 4.432, 4.735]}
                rotation={[-0.093, -0.089, -0.008]}
              />
              <mesh
                name="screens"
                castShadow
                receiveShadow
                geometry={nodes.screens.geometry}
                material={materials.screens}
                position={[-4.109, 0, -25.524]}
                rotation={[Math.PI, -Math.PI / 4, Math.PI]}
                scale={0.608}
              />
              <group
                name="stage1_speaker001"
                position={[-11.234, 2.249, 3.099]}
                rotation={[-Math.PI, 0.942, -Math.PI]}
              />
              <group
                name="stage1_speaker002"
                position={[11.219, 2.249, 3.099]}
                rotation={[Math.PI, -0.908, Math.PI]}
              />
              <group
                name="stage1_speaker003"
                position={[4.486, 2.249, -15.35]}
              />
              <group
                name="stage1_speaker004"
                position={[-4.501, 2.249, -15.35]}
              />
              <group
                name="stage1_source"
                position={[0, 1.832, -16.587]}
                scale={1.8}
              />
              <group
                name="stage2_speaker001"
                position={[31.197, 2.249, 19.633]}
                rotation={[-Math.PI, 0.004, -Math.PI]}
              />
              <group
                name="stage2_speaker002"
                position={[19.81, 2.249, 31.038]}
                rotation={[-Math.PI, 1.56, -Math.PI]}
              />
              <group
                name="stage2_source"
                position={[23.612, 1.832, 23.441]}
                scale={1.8}
              />
            </group>
          </group>
          <group name="outdoorFestival_biplaneglb">
            <group name="Scene_12">
              <group name="spinAround">
                <mesh
                  name="biplane_prop"
                  castShadow
                  receiveShadow
                  geometry={nodes.biplane_prop.geometry}
                  material={materials.prop}
                  position={[-0.255, 56.417, -99.732]}
                  rotation={[0.436, 0, 0]}
                />
                <group
                  name="biplane003"
                  position={[-0.255, 56.417, -99.732]}
                  rotation={[0.436, 0, 0]}
                >
                  <mesh
                    name="Cylinder103_0"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder103_0.geometry}
                    material={materials.gradient}
                    morphTargetDictionary={
                      nodes.Cylinder103_0.morphTargetDictionary
                    }
                    morphTargetInfluences={
                      nodes.Cylinder103_0.morphTargetInfluences
                    }
                  />
                  <mesh
                    name="Cylinder103_1"
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder103_1.geometry}
                    material={materials['signs trans']}
                    morphTargetDictionary={
                      nodes.Cylinder103_1.morphTargetDictionary
                    }
                    morphTargetInfluences={
                      nodes.Cylinder103_1.morphTargetInfluences
                    }
                  />
                </group>
              </group>
            </group>
          </group>
          <group name="outdoorFestival_hot_air_balloonglb">
            <group name="Scene_13">
              <mesh
                name="hot_air_balloon001"
                castShadow
                receiveShadow
                geometry={nodes.hot_air_balloon001.geometry}
                material={materials.gradient}
              />
            </group>
          </group>
          <group name="outdoorFestival_entry_signglb">
            <group name="Scene_14" />
          </group>
          <group name="outdoorFestival_info_signglb">
            <group name="Scene_15" />
          </group>
          <group name="outdoorFestival_lemonade_signglb">
            <group name="Scene_16" />
          </group>
          <group name="outdoorFestival_staff_only_signglb">
            <group name="Scene_17" />
          </group>
          <group
            name="outdoorFestival_GEESEglb"
            position={[548.902, 28, 887.042]}
            rotation={[0, 0.576, 0]}
          >
            <group name="Scene_18">
              <group name="GEESE" position={[0, 0, -1500]}>
                <group name="GOOSE_1">
                  <group name="WING_RIGHT">
                    <skinnedMesh
                      name="goose"
                      geometry={nodes.goose.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose.skeleton}
                    />
                    <primitive object={nodes.wing_upperR} />
                    <primitive object={nodes.wing_upperL} />
                    <primitive object={nodes.neutral_bone} />
                  </group>
                  <group name="Bone" rotation={[-Math.PI / 2, 0, 0]} />
                </group>
                <group name="GOOSE_2">
                  <group name="WING_RIGHT001" position={[-2.135, 0, 3.089]}>
                    <skinnedMesh
                      name="goose001"
                      geometry={nodes.goose001.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose001.skeleton}
                    />
                    <primitive object={nodes.wing_upperR_1} />
                    <primitive object={nodes.wing_upperL_1} />
                    <primitive object={nodes.neutral_bone_1} />
                  </group>
                  <group
                    name="Bone_1"
                    position={[-2.135, 0, 3.089]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                </group>
                <group name="GOOSE_3">
                  <group name="WING_RIGHT002" position={[2.64, 0, 3.146]}>
                    <skinnedMesh
                      name="goose002"
                      geometry={nodes.goose002.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose002.skeleton}
                    />
                    <primitive object={nodes.wing_upperR_2} />
                    <primitive object={nodes.wing_upperL_2} />
                    <primitive object={nodes.neutral_bone_2} />
                  </group>
                  <group
                    name="Bone_2"
                    position={[2.64, 0, 3.146]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                </group>
                <group name="GOOSE_4">
                  <group name="WING_RIGHT003" position={[-4.057, 0, 5.791]}>
                    <skinnedMesh
                      name="goose003"
                      geometry={nodes.goose003.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose003.skeleton}
                    />
                    <primitive object={nodes.wing_upperR_3} />
                    <primitive object={nodes.wing_upperL_3} />
                    <primitive object={nodes.neutral_bone_3} />
                  </group>
                  <group
                    name="Bone_3"
                    position={[-4.057, 0, 6.291]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                </group>
                <group name="GOOSE_5">
                  <group name="WING_RIGHT004" position={[4.97, 0, 6.407]}>
                    <skinnedMesh
                      name="goose004"
                      geometry={nodes.goose004.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose004.skeleton}
                    />
                    <primitive object={nodes.wing_upperR_4} />
                    <primitive object={nodes.wing_upperL_4} />
                    <primitive object={nodes.neutral_bone_4} />
                  </group>
                  <group
                    name="Bone_4"
                    position={[4.97, 0, 6.407]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                </group>
                <group name="GOOSE_6">
                  <group name="WING_RIGHT005" position={[-5.106, 0, 10.717]}>
                    <skinnedMesh
                      name="goose005"
                      geometry={nodes.goose005.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose005.skeleton}
                    />
                    <primitive object={nodes.wing_upperR_5} />
                    <primitive object={nodes.wing_upperL_5} />
                    <primitive object={nodes.neutral_bone_5} />
                  </group>
                  <group
                    name="Bone_5"
                    position={[-5.106, 0, 10.717]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                </group>
                <group name="GOOSE_7">
                  <group name="WING_RIGHT006" position={[6.018, 0, 9.668]}>
                    <skinnedMesh
                      name="goose006"
                      geometry={nodes.goose006.geometry}
                      material={materials.gradient}
                      skeleton={nodes.goose006.skeleton}
                    />
                    <primitive object={nodes.wing_upperR_6} />
                    <primitive object={nodes.wing_upperL_6} />
                    <primitive object={nodes.neutral_bone_6} />
                  </group>
                  <group
                    name="Bone_6"
                    position={[6.018, 0, 9.668]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                </group>
                <group name="goose_sound_fx" scale={0.01} />
              </group>
            </group>
          </group>
          <group name="outdoorFestival_shadow_planesglb">
            <group name="Scene_19">
              <mesh
                name="shadow_planes"
                castShadow
                receiveShadow
                geometry={nodes.shadow_planes.geometry}
                material={materials.shadows}
                position={[2.198, 0.004, 12.537]}
              />
            </group>
          </group>
        </group>
        <group name="PARTICLES">
          <group
            name="Particle_Emitter_DUST"
            position={[4.722, 8, 0.197]}
            rotation={[Math.PI / 2, Math.PI / 2, 0]}
            scale={69.6}
          />
        </group>
        <group name="SOUND_FX">
          <group
            name="Frogs-Lisa_Redfern-1150052170mp3"
            position={[-56.5, -0.5, 61.5]}
          />
          <group
            name="Sunny_Day-SoundBiblecom-2064222612mp3"
            position={[0, -1, 0]}
          />
        </group>
        <group name="SPAWNERS">
          <group
            name="Spawner_-_Bean_Bag_1"
            position={[-16.448, 0.041, 30.84]}
          />
          <group
            name="Spawner_-_Bean_Bag_2"
            position={[-30.237, 0.041, 30.84]}
          />
          <group name="Spawner_-_Lemonade" position={[0.401, 1.165, 27.158]} />
        </group>
        <group name="Skybox" />
        <group
          name="Directional_Light"
          position={[-1, 3, 0]}
          rotation={[0.934, 0.554, -0.043]}
        />
        <group
          name="scene-preview-camera"
          position={[41.461, 9.651, -9.336]}
          rotation={[2.839, 1.396, -Math.PI]}
        />
        <mesh
          name="CombinedMesh"
          castShadow
          receiveShadow
          geometry={nodes.CombinedMesh.geometry}
          material={materials['signs trans']}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/model');
