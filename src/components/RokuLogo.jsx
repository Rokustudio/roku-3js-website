import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RokuLogo(props) {
  const { scene } = useGLTF('/models/3d_logoroku/roku_logo.gltf'); 
  const logoRef = useRef();

  const currentOpacity = props.opacity !== undefined ? props.opacity : 1;

  const glassScene = useMemo(() => {
    if (!scene) return null;

    const clonedScene = scene.clone(); 

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#FF0000'), 
          transparent: true,        // <-- Ini sudah benar
          opacity: currentOpacity * 1, // <-- Opacity dasar, sesuaikan (0.7 cukup baik)
          metalness: 0,             
          roughness: 0.1,           // <-- Coba 0.1 untuk lebih bening, naikkan untuk buram
          transmission: 1,          
          ior: 1.5,                 
          thickness: 1.5,           
          attenuationColor: new THREE.Color('#FF0000'), 
          attenuationDistance: 0.5, 
          clearcoat: 1,             
          clearcoatRoughness: 0.0,  
          
          // === TAMBAHKAN DUA PROPERTI INI UNTUK TRANSPARANSI YANG BENAR ===
          depthWrite: false,        // <-- SANGAT PENTING untuk objek transparan
          alphaToCoverage: false,   // <-- Biasanya false untuk transparansi material ini
          // ===============================================================
        });
        child.material.needsUpdate = true;
      }
    });
    return clonedScene;
  }, [scene, currentOpacity]);

  // Animasi putaran otomatis diagonal (seperti sebelumnya)
  useFrame((state, delta) => {
    if (logoRef.current) {
      logoRef.current.rotation.x += delta * 0.3;
      logoRef.current.rotation.z += delta * 0.2;
    }
  });

  if (!glassScene) {
    return null;
  }

  return (
    <primitive
      object={glassScene} 
      ref={logoRef}
      {...props} 
      // === Opsional: Atur renderOrder jika masih ada masalah ===
      // renderOrder={1} // Beri nilai lebih tinggi dari objek non-transparan lainnya
    />
  );
}

useGLTF.preload('/models/3d_logoroku/roku_logo.gltf');
