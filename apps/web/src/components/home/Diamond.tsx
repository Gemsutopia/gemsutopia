'use client';

import { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

function DiamondModel() {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/models/round_diamond_57_edges.glb');
  const { camera } = useThree();

  useEffect(() => {
    // Apply material to all meshes
    gltf.scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#88ccff',
          metalness: 0.9,
          roughness: 0.1,
        });
      }
    });
  }, [gltf, camera]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={gltf.scene} />
      </group>
    </Center>
  );
}

useGLTF.preload('/models/round_diamond_57_edges.glb');

interface DiamondProps {
  className?: string;
}

export default function Diamond({ className }: DiamondProps) {
  return (
    <div className={className} style={{ border: '1px solid red' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'rgba(255,0,0,0.1)' }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, -5]} intensity={1} />

        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="red" />
            </mesh>
          }
        >
          <DiamondModel />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
}
