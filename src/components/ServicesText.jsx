import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import BrandText from './BrandText.jsx';

export default function ServicesText({
  scrollProgress = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  // Positioning diatur dari parent (Experience / anchor Services)
  const groupRef = useRef();
  const titleRef = useRef();
  // Urutan: [svc0Title, svc0Desc, svc1Title, svc1Desc, ..., ctaLine1, ctaLine2]
  const serviceRefs = useRef([]);

  // Service items + deskripsi
  const services = [
    {
      title: 'Brand Identity',
      description:
        'Comprehensive visual identity\nsystems that capture your\nbrand\'s essence and values.',
    },
    {
      title: 'Web Design',
      description:
        'Modern, responsive websites\nthat combine aesthetics\nwith functionality.',
    },
    {
      title: 'Digital Strategy',
      description:
        'Strategic digital solutions\nthat drive engagement\nand business growth.',
    },
    {
      title: 'Creative Direction',
      description:
        'End-to-end creative guidance\nfor campaigns and\nbrand experiences.',
    },
  ];

  // Inisialisasi refs + pastikan material transparent (agar opacity bekerja)
  useEffect(() => {
    const need = services.length * 2 + 2; // 2 per service + 2 CTA
    if (serviceRefs.current.length !== need) {
      serviceRefs.current = new Array(need).fill(null);
    }
    const all = [titleRef.current, ...serviceRefs.current];
    all.forEach((n) => {
      if (n?.material) {
        n.material.transparent = true;
        // start dari 0 untuk animasi masuk
        if (n.material.opacity == null || n.material.opacity > 1) {
          n.material.opacity = 0;
        }
      }
    });
  }, [services.length]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Fade-in dari 0.8 → 1.0
    const fadeProgress = Math.max(0, (scrollProgress - 0.8) / 0.2);

    // Title
    if (titleRef.current?.material) {
      titleRef.current.material.opacity = Math.min(1, fadeProgress);
    }

    // Item & CTA (stagger halus)
    serviceRefs.current.forEach((ref, idx) => {
      if (!ref?.material) return;
      const delay = idx * 0.1;
      const p = Math.max(0, Math.min(1, (fadeProgress - delay) / 0.3));
      ref.material.opacity = p;

      // Slide-in subtle: mapping posisi Y berdasar pasangan title/desc
      // idx 0,1 → service 0; idx 2,3 → service 1; dst.
      const iService = Math.floor(idx / 2);
      const isTitle = idx % 2 === 0;

      // Posisi baseline sama dengan group di bawah (Our Services grid)
      // Title sedikit di atas desc-nya.
      let originalY;
      if (idx < services.length * 2) {
        // Services
        originalY = -1 - iService * 1.8 + (isTitle ? 0.3 : -0.2);
      } else {
        // CTA block (dua baris) — baseline -8, -8.4
        originalY = -8 - (idx === services.length * 2 + 1 ? 0.4 : 0);
      }

      ref.position.y = originalY + (1 - p) * 0.5; // naik 0.5 saat masuk
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Section Title */}
      <BrandText
        ref={titleRef}
        size="large"
        weight="regular"
        color="#000000"
        textAlign="left"
        anchorX="left"
        position={[0, 1, 0]}
      >
        Our Services
      </BrandText>

      {/* Services Grid (teks) */}
      {services.map((service, index) => (
        <group key={index} position={[0, -1 - index * 1.8, 0]}>
          {/* Service Title */}
          <BrandText
            ref={(el) => (serviceRefs.current[index * 2] = el)}
            size="body"
            weight="medium"
            color="#000000"
            textAlign="left"
            anchorX="left"
            position={[0, 0.3, 0]}
          >
            {service.title}
          </BrandText>

          {/* Service Description */}
          <BrandText
            ref={(el) => (serviceRefs.current[index * 2 + 1] = el)}
            size="caption"
            weight="regular"
            color="#666666"
            textAlign="left"
            anchorX="left"
            position={[0, -0.2, 0]}
            lineHeight={1.4}
          >
            {service.description}
          </BrandText>
        </group>
      ))}

      {/* Contact CTA */}
      <group position={[0, -8, 0]}>
        <BrandText
          ref={(el) => (serviceRefs.current[services.length * 2] = el)}
          size="caption"
          weight="regular"
          color="#999999"
          textAlign="left"
          anchorX="left"
        >
          Ready to start your project?
        </BrandText>

        <BrandText
          ref={(el) => (serviceRefs.current[services.length * 2 + 1] = el)}
          size="body"
          weight="medium"
          color="#000000"
          textAlign="left"
          anchorX="left"
          position={[0, -0.4, 0]}
        >
          hello@rokustudio.com
        </BrandText>
      </group>
    </group>
  );
}
