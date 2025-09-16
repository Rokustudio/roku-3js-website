import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls /*, AdaptiveDpr, PerformanceMonitor*/ } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';

import Navbar from './components/Navbar.jsx';
import Experience from './components/Experience.jsx';
import DistortionEffect from './components/DistortionEffect.jsx';
import MagnifierCursor from './components/MagnifierCursor.jsx';

export default function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Autoplay stabil + hormati prefers-reduced-motion
    const onVis = () => (document.hidden ? v.pause() : v.play().catch(() => {}));
    document.addEventListener('visibilitychange', onVis);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onRM = () => {
      if (mq.matches) v.pause();
      else v.play().catch(() => {});
    };
    mq.addEventListener?.('change', onRM);
    onRM();

    // Data Saver (jika aktif, pelankan sedikit)
    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    if (conn?.saveData) v.playbackRate = 0.9;

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      mq.removeEventListener?.('change', onRM);
    };
  }, []);

  return (
    <div className="w-screen h-screen relative isolate">
      {/* Canvas dengan background color */}
      <Canvas
        shadows
        dpr={[1, 2]}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        camera={{ position: [0, 0, 15], fov: 35 }}
      >
        {/* Tetap gunakan warna lama di Canvas */}
        <color attach="background" args={['#d8dde3']} />

        {/* Konten 3D utama */}
        <ScrollControls pages={2.5} damping={0.3}>
          <Experience />
        </ScrollControls>

        {/* Post-processing */}
        <EffectComposer>
          <DistortionEffect />
          {/* Tambah efek lain di sini kalau ada (Bloom/Noise/Vignette, dll.) */}
        </EffectComposer>

        {/* Kursor kustom (di luar composer) */}
        <MagnifierCursor />

        {/*
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />
        */}
      </Canvas>

      {/* === VIDEO OVERLAY (SCREEN) — di atas Canvas, di bawah Navbar === */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          // ganti 'screen' -> 'multiply' kalau mau mode multiply
          mixBlendMode: 'screen',
          contain: 'paint',
        }}
      >
        <video
          ref={videoRef}
          id="overlayVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"                         // "metadata" kalau mau super hemat
          poster="/media/overlay_poster.jpg"     // opsional (letakkan di public/media)
          className="w-full h-full object-cover"
          onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
          style={{
            // Atur intensitas efek
            opacity: 1,                          // turunkan kalau terlalu kuat (mis. 0.8)
            filter: 'brightness(0.9) contrast(1.1)',
            transform: 'translateZ(0)',
            willChange: 'transform, opacity',
            objectPosition: 'center center',
          }}
        >
          {/* Siapkan MP4 dulu (paling kompatibel). Tambah WebM kalau ada. */}
          {/* <source src="/media/overlay.webm" type="video/webm" /> */}
          <source src="/media/overlay.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Navbar tetap paling atas (komponen punya z-50) */}
      <Navbar />
    </div>
  );
}
