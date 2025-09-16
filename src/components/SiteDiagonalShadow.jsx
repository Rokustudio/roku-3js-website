// src/components/SiteDiagonalShadow.jsx  (PERFORMANCE LITE)
import React from 'react';

export default function SiteDiagonalShadow() {
  // warna abu (ubah alpha kalau mau lebih/kurang kontras)
  const stripeThick = 'repeating-linear-gradient(24deg, rgba(88,88,90,0.22) 0 20px, rgba(88,88,90,0) 20px 160px)';
  const stripeThin  = 'repeating-linear-gradient(24deg, rgba(88,88,90,0.12) 0 6px,  rgba(88,88,90,0)  6px 160px)';

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,          // di atas Canvas, di bawah Navbar
        pointerEvents: 'none',
        // TANPA mix-blend & TANPA blur → jauh lebih ringan
        overflow: 'hidden',
      }}
    >
      {/* STRIPES — elemen lebih besar dari viewport agar tidak "patah" */}
      <div
        style={{
          position: 'absolute',
          inset: '-15%',
          backgroundImage: `${stripeThick}, ${stripeThin}`,
          backgroundRepeat: 'repeat',
          // offset beda utk selang-seling
          backgroundPosition: '0px 0px, 80px 50px',
          // animasi GPU (transform), bukan background-position
          transform: 'translate3d(0,0,0)',
          animation: 'stripeMove 18s ease-in-out infinite alternate',
          willChange: 'transform',
          contain: 'paint',
        }}
      />

      {/* TEPI LEMBUT tanpa mask/filter */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.10) 100%)',
        }}
      />

      <style>{`
        @keyframes stripeMove {
          0%   { transform: translate3d(0px,   0px, 0); }
          100% { transform: translate3d(220px, 140px, 0); }
        }
        @media (prefers-reduced-motion: reduce), (max-width: 768px) {
          /* Non-desktop: lebih pelan/stop animasi */
          .stripe-slow { animation-duration: 26s; }
        }
      `}</style>
    </div>
  );
}
