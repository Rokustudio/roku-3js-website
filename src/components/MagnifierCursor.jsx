// src/components/MagnifierCursor.jsx (KODE FINAL DENGAN PERBAIKAN SCROLL)

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

export default function MagnifierCursor() {
  const { viewport } = useThree();
  const groupRef = useRef();
  const mousePos = useRef({ x: 0, y: 0 });

  window.addEventListener('mousemove', (event) => {
    mousePos.current = {
      x: event.clientX,
      y: event.clientY,
    };
  });

  // Tambahkan 'state' sebagai argumen untuk mendapatkan akses ke kamera
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.5;

      const targetX = (mousePos.current.x / window.innerWidth - 0.5) * viewport.width;

      // --- INI ADALAH PERBAIKANNYA ---
      // Kita tambahkan posisi Y kamera saat ini ke perhitungan target Y kursor.
      const targetY = -(mousePos.current.y / window.innerHeight - 0.5) * viewport.height + state.camera.position.y;
      // -----------------------------
      
      groupRef.current.position.lerp(new Vector3(targetX, targetY, 0), 0.1);
    }
  });

  return (
    <group ref={groupRef} renderOrder={999}>
      <mesh>
        <ringGeometry args={[0.38, 0.4, 32, 1, 0, Math.PI * 1.8]} />
        <meshBasicMaterial color="black" transparent depthTest={false} />
      </mesh>
      
      <mesh>
        <circleGeometry args={[0.03, 32]} />
        <meshBasicMaterial color="black" transparent depthTest={false} />
      </mesh>
    </group>
  );
}