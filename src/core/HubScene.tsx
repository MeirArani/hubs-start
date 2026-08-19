import { UserInputSystem, useInput } from '#/input/UserInput.client.tsx';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function HubScene() {
  useFrame((state, delta) => {
    UserInputSystem();
    console.log(useInput());
  });
  const gltf = useLoader(GLTFLoader, '/testWorld.bin');
  console.log('Loaded gltf');
  return (
    <>
      <primitive object={gltf.scene} />
    </>
  );
}
