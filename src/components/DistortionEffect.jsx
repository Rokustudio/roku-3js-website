// src/components/DistortionEffect.jsx (KODE FINAL DENGAN DEKLARASI tDiffuse)

import { useMemo, useEffect } from 'react';
import { Uniform, Vector2 } from 'three';
import { Effect } from 'postprocessing';
import { useFrame } from '@react-three/fiber';

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 uMouse;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 mouse = uMouse;
    float dist = distance(uv, mouse);

    // --- UBAH ANGKA DI BAWAH INI ---
    // Ganti 0.5 menjadi angka yang lebih kecil, misalnya 0.2, untuk memperkecil radius efek.
    float strength = smoothstep(0.2, 0.0, dist);
    // -----------------------------

    float wavePattern = sin(dist * 40.0);
    float waveStrength = wavePattern * strength * 0.03;
    vec2 direction = normalize(mouse - uv);
    vec2 distortedUv = uv + direction * waveStrength;

    float colorSeparation = strength * 0.02;
    vec4 redChannel = texture(tDiffuse, distortedUv + vec2(colorSeparation, 0.0));
    vec4 greenChannel = texture(tDiffuse, distortedUv);
    vec4 blueChannel = texture(tDiffuse, distortedUv - vec2(colorSeparation, 0.0));

    outputColor = vec4(redChannel.r, greenChannel.g, blueChannel.b, 1.0);
  }
`;

class DistortionEffectImpl extends Effect {
  constructor() {
    super('DistortionEffect', fragmentShader, {
      uniforms: new Map([['uMouse', new Uniform(new Vector2())]]),
    });
  }
}

export default function DistortionEffect() {
  const effect = useMemo(() => new DistortionEffectImpl(), []);
  const mousePos = useMemo(() => new Vector2(0.5, 0.5), []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      mousePos.set(
        event.clientX / window.innerWidth,
        1.0 - event.clientY / window.innerHeight
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mousePos]);
  
  useFrame(() => {
    effect.uniforms.get('uMouse').value.lerp(mousePos, 0.05);
  });

  return <primitive object={effect} />;
}