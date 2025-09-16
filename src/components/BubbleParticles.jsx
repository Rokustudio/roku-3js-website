// src/components/BubbleParticles.jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BubbleParticles({ 
  fishRef, 
  count = 40,
  sizeRange = [0.15, 0.35],
  lifespan = 4.0,
}) {
  const particlesRef = useRef();
  const timeRef = useRef(0);
  
  // Create particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.4 + 0.3,
          (Math.random() - 0.5) * 0.2
        ),
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        life: Math.random() * lifespan,
        maxLife: lifespan,
        wobble: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, [count, sizeRange, lifespan]);

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    particles.forEach((particle, i) => {
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      // Initial colors with slight variation
      colors[i * 3] = 0.8 + Math.random() * 0.2;     // R
      colors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // G
      colors[i * 3 + 2] = 1.0;                       // B
      
      sizes[i] = particle.size;
    });
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geo;
  }, [particles, count]);

  // Create bubble texture programmatically
  const bubbleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const centerX = 64;
    const centerY = 64;
    const radius = 60;
    
    // Create main bubble gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    // Bubble colors with iridescent effect
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.1, 'rgba(240, 248, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(200, 230, 255, 0.6)');
    gradient.addColorStop(0.5, 'rgba(180, 220, 255, 0.4)');
    gradient.addColorStop(0.7, 'rgba(200, 180, 255, 0.3)');
    gradient.addColorStop(0.85, 'rgba(255, 200, 220, 0.2)');
    gradient.addColorStop(0.95, 'rgba(200, 220, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
    
    // Draw main bubble
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add highlight
    const highlightGradient = ctx.createRadialGradient(
      centerX - 20, centerY - 20, 0,
      centerX - 20, centerY - 20, 25
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY - 20, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Add secondary smaller highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(centerX + 15, centerY + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Add iridescent rainbow effect on edge
    ctx.strokeStyle = 'rgba(255, 180, 200, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 0.6);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(180, 255, 200, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(180, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, Math.PI * 1.4, Math.PI * 2);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }, []);

  // Create material
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      map: bubbleTexture,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [bubbleTexture]);

  // Track previous fish position
  const prevFishPos = useRef(new THREE.Vector3());
  const fishVelocity = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!fishRef?.current || !particlesRef.current) return;
    
    const dt = Math.min(delta, 0.1);
    timeRef.current += dt;
    
    // Get fish position and calculate velocity
    const fishPosition = fishRef.current.position;
    fishVelocity.current.subVectors(fishPosition, prevFishPos.current);
    const fishSpeed = fishVelocity.current.length();
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    const colors = particlesRef.current.geometry.attributes.color.array;
    const sizes = particlesRef.current.geometry.attributes.size.array;
    
    // Update each particle
    particles.forEach((particle, i) => {
      // Update life
      particle.life -= dt;
      
      // Reset particle if it dies or goes too high
      if (particle.life <= 0 || particle.position.y > fishPosition.y + 6) {
        // Reset at fish position
        particle.position.copy(fishPosition);
        particle.position.x += (Math.random() - 0.5) * 0.4;
        particle.position.y += (Math.random() - 0.5) * 0.2;
        particle.position.z += (Math.random() - 0.5) * 0.4;
        
        particle.life = particle.maxLife;
        particle.wobble = Math.random() * Math.PI * 2;
        
        // Skip more bubbles if fish is not moving - untuk lebih minimal
        if (fishSpeed < 0.2 && Math.random() > 0.1) {
          particle.life = 0;
        }
        
        // Reset velocity
        particle.velocity.set(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.4 + 0.3,
          (Math.random() - 0.5) * 0.2
        );
      }
      
      // Update active particles
      if (particle.life > 0) {
        // Physics
        particle.velocity.y += dt * 0.2; // Buoyancy
        particle.velocity.multiplyScalar(0.985); // Drag
        
        // Update position
        particle.position.x += particle.velocity.x * dt;
        particle.position.y += particle.velocity.y * dt;
        particle.position.z += particle.velocity.z * dt;
        
        // Wobble motion
        particle.wobble += dt * 2;
        particle.position.x += Math.sin(particle.wobble) * 0.003;
        particle.position.z += Math.cos(particle.wobble * 0.8) * 0.003;
        
        // Size changes
        const lifeRatio = particle.life / particle.maxLife;
        const growthFactor = 1.0 + (1.0 - lifeRatio) * 0.4;
        sizes[i] = particle.size * growthFactor;
        
        // Fade in/out
        if (lifeRatio > 0.9) {
          sizes[i] *= (1.0 - lifeRatio) * 10;
        } else if (lifeRatio < 0.2) {
          sizes[i] *= lifeRatio * 5;
        }
        
        // Update colors for iridescent effect
        const time = timeRef.current;
        colors[i * 3] = 0.7 + Math.sin(time + i) * 0.3;
        colors[i * 3 + 1] = 0.8 + Math.sin(time + i * 1.5) * 0.2;
        colors[i * 3 + 2] = 0.9 + Math.sin(time + i * 2) * 0.1;
      } else {
        // Hide inactive particles
        particle.position.y = -1000;
        sizes[i] = 0;
      }
      
      // Update buffer
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    });
    
    // Mark for update
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
    particlesRef.current.geometry.attributes.size.needsUpdate = true;
    
    // Store fish position
    prevFishPos.current.copy(fishPosition);
  });

  return (
    <points 
      ref={particlesRef} 
      geometry={geometry} 
      material={material}
      renderOrder={1}
    />
  );
}