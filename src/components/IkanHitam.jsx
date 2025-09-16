// src/components/IkanMerah.jsx (FINAL - VERSI "BONEKA MURNI")

import { useEffect, forwardRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

const IkanMerah = forwardRef((props, ref) => {
  const { scene, animations } = useGLTF("/models/black_betta/betta_black_optimized.gltf");
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.material.roughness = 0.4;
        child.material.metalness = 0.6;
      }
    });
    const action = actions[Object.keys(actions)[0]];
    if (action) action.play();
  }, [scene, actions]);

  // Tidak ada lagi useFrame. Komponen ini hanya menampilkan model.
  return (
    <group ref={ref} {...props}>
      <primitive object={scene} scale={15} />
    </group>
  );
});

export default IkanMerah;