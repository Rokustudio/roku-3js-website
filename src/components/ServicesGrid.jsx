// src/components/ServicesGrid.jsx
import { useMemo, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ServicePlane from './ServicePlane.jsx';

/** Hitung world width/height pada target untuk kamera apa pun. */
function getWorldSizeAt(camera, target, axis = 'width') {
  if (camera.isPerspectiveCamera) {
    const dist = camera.position.distanceTo(target);
    const worldH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const worldW = worldH * camera.aspect;
    return axis === 'height' ? worldH : worldW;
  }
  // Orthographic
  const worldW = camera.right - camera.left;
  const worldH = camera.top - camera.bottom;
  return axis === 'height' ? worldH : worldW;
}

/** Responsive global scale dengan autoFit + mobile focus; update tiap frame. */
function useServicesScale(
  targetVec3,
  {
    baseWidth = 12,
    uiScale = 0.8,
    min = 0.55,
    max = 1.1,
    autoFitWidth = null, // raw grid width (unscaled) to fit
    autoFitFactor = 1.0,
    fitPadding = 0.0,
    mobileFocus = true,
    mobileBreakpointPx = 768,
    mobileFocusBoost = 1.12,
  } = {}
) {
  const { camera, size } = useThree();
  const [scale, setScale] = useState(1);
  const last = useRef(0);

  useFrame(() => {
    const worldWidth = getWorldSizeAt(camera, targetVec3, 'width');

    let s;
    if (autoFitWidth) {
      const denom = Math.max(1e-6, autoFitWidth + fitPadding);
      s = (worldWidth / denom) * autoFitFactor;
    } else {
      s = worldWidth / baseWidth;
    }

    // uiScale selalu diterapkan (termasuk saat autoFit)
    s *= uiScale;

    // Fokus mobile kecil: sedikit zoom in
    if (size.width < mobileBreakpointPx && mobileFocus) {
      s *= mobileFocusBoost;
    }

    s = THREE.MathUtils.clamp(s, min, max);
    if (Math.abs(s - last.current) > 0.0005) {
      last.current = s;
      setScale(s);
    }
  });

  // Re-eval saat resize
  useMemo(() => (last.current = 0), [size.width, size.height]);

  return scale;
}

export default function ServicesGrid({
  // Placement (flat di lantai)
  origin = new THREE.Vector3(14, -5, 0),
  rotation = [-Math.PI / 2, 0, 0],

  // Card size (local units; akan diskalakan oleh group)
  size = [3.2, 2.0], // [w, h]

  // Responsive columns
  colsDesktop = 5,
  colsTablet = 3,
  colsMobile = 2,
  colsSmall = 1,
  bpDesktopPx = 1280,
  bpTabletPx = 768,
  bpMobilePx = 480,

  // Visual gaps (target world spacing; stabil meski scale berubah)
  screenGapX = 0.32,
  screenGapZ = 0.32,

  // Scale behavior
  uiScale = 0.8,
  baseWidth = 12,
  minScale = 0.55,
  maxScale = 1.1,
  autoFit = true,
  autoFitFactor = 0.9,
  fitPadding = 0.6,
  mobileFocus = true,

  // Items
  items = [
    { title: 'Brand Development', imageUrl: '/textures/services/brand.jpg' },
    { title: 'Design Needs', imageUrl: '/textures/services/design.jpg' },
    { title: 'Social Media Management', imageUrl: '/textures/services/social.jpg' },
    { title: 'Performance Marketing', imageUrl: '/textures/services/performance.jpg' },
    { title: 'Production', imageUrl: '/textures/services/production.jpg' },
  ],

  // Default props ke tiap ServicePlane
  cardProps = {
    cornerRadius: 0.12,
    titleSize: 'caption',
    titleLetterSpacing: -0.04,
    titlePaddingXR: 0.08, // padding kiri (rasio terhadap lebar kartu)
  },
}) {
  const { size: viewportPx } = useThree();

  // Normalisasi origin ke Vector3
  const originVec = useMemo(
    () => (origin.isVector3 ? origin : new THREE.Vector3(...origin)),
    [origin]
  );

  // Tentukan kolom berdasar breakpoint
  const cols = useMemo(() => {
    const w = viewportPx.width;
    if (w >= bpDesktopPx) return colsDesktop;
    if (w >= bpTabletPx) return colsTablet;
    if (w >= bpMobilePx) return colsMobile;
    return colsSmall;
  }, [
    viewportPx.width,
    bpDesktopPx,
    bpTabletPx,
    bpMobilePx,
    colsDesktop,
    colsTablet,
    colsMobile,
    colsSmall,
  ]);

  const rows = Math.ceil(items.length / cols);

  // Raw (unscaled) total width untuk autoFit
  const rawTotalWidth = useMemo(() => {
    return cols * size[0] + (cols - 1) * screenGapX;
  }, [cols, size, screenGapX]);

  // Global scale
  const servicesScale = useServicesScale(originVec, {
    baseWidth,
    uiScale,
    min: minScale,
    max: maxScale,
    autoFitWidth: autoFit ? rawTotalWidth : null,
    autoFitFactor,
    fitPadding,
    mobileFocus,
  });

  // Konversi visual gap → local gap (agar jarak dunia stabil)
  const effGapX = useMemo(() => screenGapX / servicesScale, [screenGapX, servicesScale]);
  const effGapZ = useMemo(() => screenGapZ / servicesScale, [screenGapZ, servicesScale]);

  // Total local untuk centering
  const totalWLocal = useMemo(
    () => cols * size[0] + (cols - 1) * effGapX,
    [cols, size, effGapX]
  );
  const totalHLocal = useMemo(
    () => rows * size[1] + (rows - 1) * effGapZ,
    [rows, size, effGapZ]
  );

  // Posisi (centered grid)
  const positions = useMemo(() => {
    const arr = [];
    const startX = -totalWLocal / 2 + size[0] / 2;
    const startZ = -totalHLocal / 2 + size[1] / 2;
    for (let i = 0; i < items.length; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = startX + c * (size[0] + effGapX);
      const z = startZ + r * (size[1] + effGapZ);
      arr.push([x, 0, z]);
    }
    return arr;
  }, [items.length, cols, size, effGapX, effGapZ, totalWLocal, totalHLocal]);

  return (
    <group
      position={originVec.toArray()}
      rotation={rotation}
      scale={servicesScale}
      frustumCulled={false}
    >
      {items.map((it, i) => (
        <ServicePlane
          key={i}
          title={it.title}
          imageUrl={it.imageUrl}
          size={size}
          position={positions[i]}
          rotation={[0, 0, 0]}
          {...cardProps}
        />
      ))}
    </group>
  );
}
