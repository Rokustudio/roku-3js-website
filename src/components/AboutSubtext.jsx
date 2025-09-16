import React, { useMemo } from "react";
import BrandText from "./BrandText";

export default function AboutSubtext({
  text = "Default subtext",
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  color = "black",
  size = "body",
  weight = "regular",
  variant = "fadeUp",
  scrollProgress = null, // 0..1 dari Experience; kalau null & onMount -> tampil penuh
  onMount = true,
}) {
  // keadaan awal
  const init = useMemo(() => {
    switch (variant) {
      case "fadeUp":  return { x: 0,   y: 0.3, opacity: 0, letterSpacing: -0.05 };
      case "revealX": return { x: -0.5,y: 0,   opacity: 0, letterSpacing: -0.05 };
      default:        return { x: 0,   y: 0,   opacity: 0, letterSpacing: -0.05 };
    }
  }, [variant]);

  // keadaan akhir
  const fin = useMemo(() => ({ x: 0, y: 0, opacity: 1, letterSpacing: -0.05 }), []);

  // progress 0..1
  const p = Math.max(0, Math.min(1, scrollProgress != null ? scrollProgress : (onMount ? 1 : 0)));
  const lerp = (a, b) => a + (b - a) * p;

  return (
    <group position={position} rotation={rotation}>
      <BrandText
        size={size}
        weight={weight}
        color={color}
        anchorX="left"
        anchorY="middle"
        textAlign="left"
        lineHeight={1.3}
        letterSpacing={lerp(init.letterSpacing, fin.letterSpacing)}
        position={[lerp(init.x, fin.x), lerp(init.y, fin.y), 0]}
        opacity={lerp(init.opacity, fin.opacity)}
      >
        {text}
      </BrandText>
    </group>
  );
}
