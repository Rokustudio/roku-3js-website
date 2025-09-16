// File: src/components/AboutText.jsx (MENGGUNAKAN BRAND SYSTEM)

import React from 'react';
import BrandText from './BrandText'; // <-- Ganti import dari 'Text' menjadi 'BrandText'

export default function AboutText({ position }) {
  return (
    // Ganti <Text> menjadi <BrandText> dan gunakan prop semantik
    <BrandText
      size="subheadline"     // Menggunakan ukuran 0.8 dari kamus
      weight="regular"       // Menggunakan font PPMori-Regular.ttf
      color="black"          // Menggunakan warna #000000 atau #333333 dari kamus
      
      // Properti lain yang spesifik untuk komponen ini tetap di sini
      anchorX="left"
      anchorY="middle"
      textAlign="left"
      lineHeight={1.2}
      letterSpacing={-0.05}
      position={position} 

          // --- TAMBAHKAN PROPERTI ROTASI DI SINI ---
      // -Math.PI / 2 setara dengan -90 derajat
     rotation={[-Math.PI / 2, 0, 0]}
      // rotation-y={0} (tidak perlu ditulis jika 0)
      // rotation-z={0} (tidak perlu ditulis jika 0)
      // ------------------------------------------
    >
      {`Supporting Brand\nwith Design\nand Purposes.`}
    </BrandText>
  );
}