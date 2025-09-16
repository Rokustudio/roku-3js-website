// src/components/ServicePlane.jsx
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import BrandText from './BrandText.jsx';

/** Rounded-rectangle geometry helper (world units) */
function makeRoundedRectGeometry(w, h, r = 0.12, segments = 10) {
  const shape = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  const R = Math.min(Math.max(r, 0), Math.min(w, h) * 0.5 - 1e-4);

  shape.moveTo(x + R, y);
  shape.lineTo(x + w - R, y);
  shape.absarc(x + w - R, y + R, R, -Math.PI / 2, 0);
  shape.lineTo(x + w, y + h - R);
  shape.absarc(x + w - R, y + h - R, R, 0, Math.PI / 2);
  shape.lineTo(x + R, y + h);
  shape.absarc(x + R, y + h - R, R, Math.PI / 2, Math.PI);
  shape.lineTo(x, y + R);
  shape.absarc(x + R, y + R, R, Math.PI, Math.PI * 1.5);

  const geom = new THREE.ShapeGeometry(shape, segments);
  geom.computeVertexNormals?.();
  return geom;
}

export default function ServicePlane({
  /** Content */
  title = 'Service',
  imageUrl = null,

  /** Layout & look */
  size = [3.2, 2.0], // [width, height] world units
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#f6f6f6',
  cornerRadius = 0.12,
  cornerSegments = 10,

  /** Title */
  titleYOffset = 0.35, // vertical offset above plane
  titleSize = 'caption',
  titleWeight = 'regular',
  titleColor = 'black',
  titleLetterSpacing = -0.035,
  /** padding kiri responsif: pakai rasio terhadap lebar kartu */
  titlePaddingXR = 0.08, // 8% dari lebar (responsive)
  /** jika mau absolut (world units), kirim titlePaddingX dan biarkan XR = null */
  titlePaddingX = null,
  /** max width untuk wrap teks (rasio dari lebar kartu) */
  titleMaxWidthR = 0.84,

  /** Shadows */
  castShadow = true,
  receiveShadow = true,
  /** Gunakan fake soft shadow agar selalu terlihat (opsional) */
  useFakeShadow = false,

  /** Extra material override */
  materialProps = {},
}) {
  const cardRef = useRef(); // wrapper untuk plane + title
  const meshRef = useRef();
  const titleRef = useRef();

  const [hovered, setHovered] = useState(false);
  const [map, setMap] = useState(null);
  const { gl, camera } = useThree();

  useCursor(hovered);

  // SAFE texture loader
  useEffect(() => {
    let cancelled = false;
    if (!imageUrl) {
      setMap(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      imageUrl,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        try {
          const aniso =
            typeof gl?.capabilities?.getMaxAnisotropy === 'function'
              ? gl.capabilities.getMaxAnisotropy()
              : 1;
          tex.anisotropy = aniso;
        } catch {}
        setMap(tex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load texture:', imageUrl, err);
        if (!cancelled) setMap(null);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [imageUrl, gl]);

  // Rounded-rect geometry
  const geometry = useMemo(
    () => makeRoundedRectGeometry(size[0], size[1], cornerRadius, cornerSegments),
    [size, cornerRadius, cornerSegments]
  );

  // Padding kiri responsif (berdasar lebar kartu)
  const padX = useMemo(() => {
    if (titlePaddingX != null) return titlePaddingX;
    return size[0] * (titlePaddingXR ?? 0.08);
  }, [size, titlePaddingXR, titlePaddingX]);

  // Max width untuk wrap teks (agar tidak keluar dari kartu)
  const titleMaxWidth = useMemo(() => {
    return size[0] * titleMaxWidthR - padX; // sisakan padding kanan implicit
  }, [size, titleMaxWidthR, padX]);

  useFrame((_, dt) => {
    // Animasi hover diterapkan ke WRAPPER: plane + title ikut semua
    if (cardRef.current) {
      const targetScale = hovered ? 1.035 : 1.0;
      const targetLift = hovered ? 0.18 : 0.0;
      cardRef.current.scale.x = THREE.MathUtils.lerp(cardRef.current.scale.x || 1, targetScale, 8 * dt);
      cardRef.current.scale.y = THREE.MathUtils.lerp(cardRef.current.scale.y || 1, targetScale, 8 * dt);
      cardRef.current.position.y = THREE.MathUtils.lerp(cardRef.current.position.y || 0, targetLift, 8 * dt);
    }

    // Title billboard → selalu menghadap kamera
    if (titleRef.current) {
      titleRef.current.quaternion.copy(camera.quaternion);
      // Grid telentang, tegakkan kembali teks
      titleRef.current.rotateX(Math.PI / 2);
    }
  });

  return (
    <group ref={cardRef} position={position} rotation={rotation}>
      {/* Soft contact shadow */}
      {useFakeShadow ? (
        <mesh position={[0, -0.001, 0]}>
          <planeGeometry args={[size[0] * 1.22, size[1] * 1.32]} />
          <meshBasicMaterial transparent opacity={0.18} color="black" />
        </mesh>
      ) : (
        <mesh position={[0, -0.001, 0]} receiveShadow={receiveShadow}>
          <planeGeometry args={[size[0] * 1.22, size[1] * 1.32]} />
          <shadowMaterial transparent opacity={0.2} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      )}

      {/* Kartu gambar (rounded) */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          metalness={0.05}
          envMapIntensity={0.6}
          map={map || null}
          {...materialProps}
        />
      </mesh>

      {/* Title: rata kiri + padding responsif + wrap aman */}
      <group position={[-size[0] / 2 + padX, titleYOffset, 0]}>
        <group ref={titleRef}>
          <BrandText
            size={titleSize}
            weight={titleWeight}
            color={titleColor}
            textAlign="left"
            anchorX="left"
            anchorY="middle"
            letterSpacing={titleLetterSpacing}
            maxWidth={titleMaxWidth}   // asumsi BrandText meneruskan ke <Text />
            overflowWrap="break-word"  // jika BrandText mendukung prop ini
          >
            {title}
          </BrandText>
        </group>
      </group>
    </group>
  );
}
