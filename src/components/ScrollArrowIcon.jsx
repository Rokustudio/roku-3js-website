// src/components/ScrollArrowIcon.jsx (FINAL DENGAN ASPEK RASIO + ROTASI)

import { useRef, useMemo } from 'react';
import { useTexture, useScroll } from "@react-three/drei";
import { useFrame } from '@react-three/fiber';

export default function ScrollArrowIcon(props) {
  // --- BAGIAN 1: LOGIKA ASPEK RASIO (ANTI-CLIPPING) ---
  const texture = useTexture("/logos/roku_icon.svg");
  const aspect = useMemo(() => {
    if (!texture || !texture.image) return 1;
    return texture.image.naturalWidth / texture.image.naturalHeight;
  }, [texture]);

  const iconHeight = 0.5;
  const iconWidth = iconHeight * aspect;
  // --------------------------------------------------

  // --- BAGIAN 2: LOGIKA ANIMASI ROTASI ---
  const groupRef = useRef();
  const scroll = useScroll();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = scroll.offset * Math.PI * 4;
    }
  });
  // -----------------------------------------

  return (
    // 'ref' diterapkan pada grup untuk rotasi
    <group ref={groupRef} {...props}>
      {/* 'mesh' dengan skala yang benar untuk aspek rasio */}
      <mesh scale={[iconWidth, iconHeight, 1]}>
        <planeGeometry />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          depthTest={false}
        />
      </mesh>
    </group>
  );
}