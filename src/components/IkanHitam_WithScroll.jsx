// File: src/components/IkanHitam.jsx

import { useEffect, useRef, useMemo } from 'react';
import { useGLTF, useAnimations, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function lerpAngle(start, end, amount) {
  const delta = (end - start + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return start + delta * amount;
}

const _targetPosition = new THREE.Vector3();

export default function IkanHitam(props) {
  const ikanRef = useRef();
  const { scene, animations } = useGLTF("/models/black_betta/betta_black_optimized.gltf");
  const { actions } = useAnimations(animations, ikanRef);
  const scroll = useScroll();

  // KEMBALIKAN orbitSpeed untuk animasi idle
  const config = useMemo(() => ({
    orbitRadius: 4,
    maxSpeed: 1.5,
    maxForce: 0.05,
    turnSpeed: 4,
    orbitSpeed: 0.3, // <-- DIKEMBALIKAN
  }), []);

  // KEMBALIKAN path.current untuk menyimpan state animasi idle
  const path = useRef({
    angle: Math.random() * Math.PI * 2,
  });

  const state = useRef({
    position: new THREE.Vector3(config.orbitRadius, 0, 0),
    velocity: new THREE.Vector3(0, 0, -config.maxSpeed),
    acceleration: new THREE.Vector3(0, 0, 0),
  });

  useEffect(() => {
    if (actions) { const actionNames = Object.keys(actions); if (actionNames.length > 0) { actions[actionNames[0]].play(); } }
    const startAngle = Math.random() * Math.PI * 2;
    state.current.position.set( Math.cos(startAngle) * config.orbitRadius, 0, Math.sin(startAngle) * config.orbitRadius );
  }, [actions, config.orbitRadius]);

  const applyForce = (force) => {
    state.current.acceleration.add(force);
  };

  useFrame((clock, delta) => {
    const fish = ikanRef.current;
    if (!fish) return;
    const currentState = state.current;

    // --- LOGIKA HIBRIDA ---
    if (scroll.offset < 0.01) {
      // LOGIKA LAMA (BERBASIS WAKTU)
      path.current.angle += config.orbitSpeed * delta;
      _targetPosition.set(
        Math.cos(path.current.angle) * config.orbitRadius,
        0,
        Math.sin(path.current.angle) * config.orbitRadius
      );
    } else {
      // LOGIKA BARU (BERBASIS SCROLL)
      const angle = -scroll.offset * Math.PI * 6;
      _targetPosition.set(
        Math.cos(angle) * config.orbitRadius,
        0,
        Math.sin(angle) * config.orbitRadius
      );
    }
    
    // Sisa logika fisika "pengejaran" Anda tetap sama persis
    const desiredVelocity = _targetPosition.clone().sub(currentState.position).normalize().multiplyScalar(config.maxSpeed);
    const steeringForce = desiredVelocity.sub(currentState.velocity);
    steeringForce.clampLength(0, config.maxForce);
    applyForce(steeringForce);

    currentState.velocity.add(currentState.acceleration);
    currentState.velocity.clampLength(0, config.maxSpeed);
    currentState.position.add(currentState.velocity.clone().multiplyScalar(delta));
    currentState.acceleration.set(0, 0, 0);

    fish.position.copy(currentState.position);

    const targetAngle = Math.atan2(currentState.velocity.x, currentState.velocity.z);
    const correctiveRotation = -Math.PI / 2;
    fish.rotation.y = lerpAngle( fish.rotation.y, targetAngle + correctiveRotation, delta * config.turnSpeed );
  });

  return (
    <group ref={ikanRef} {...props}>
      <primitive object={scene} scale={10} />
    </group>
  );
}