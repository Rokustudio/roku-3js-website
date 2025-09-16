// src/components/BrandText.jsx
import { forwardRef, memo, useMemo, useEffect, useState } from 'react';
import { Text } from '@react-three/drei';

/** ================= Font Files (dengan safety check) ================== **/
const fontFiles = {
  extralight: '/fonts/PPMori-Extralight.ttf',
  regular: '/fonts/PPMori-Regular.ttf',
  regularitalic: '/fonts/PPMori-RegularItalic.ttf',
  semibold: '/fonts/PPMori-SemiBold.ttf',
  semibolditalic: '/fonts/PPMori-SemiBoldItalic.ttf',
  // Fallback ke system font jika ada masalah
  systemFallback: undefined
};

/** ================= Color Palette ================== **/
const colorPalette = {
  black: '#333333',
  gray: '#666666',
  white: '#FFFFFF',
};

/** ================= Font Sizes ================== **/
const fontSizes = {
  headline: 1.5,
  subheadline: 0.8,
  large: 0.6,
  body: 0.4,
  caption: 0.20,
  micro: 0.15,
};

/** ================= Font Variants ================== **/
const variants = {
  h1: { size: 'headline', weight: 'regular' },
  h2: { size: 'subheadline', weight: 'semibold' },
  body: { size: 'body', weight: 'regular' },
  micro: { size: 'micro', weight: 'extralight' },
};

/** ================= Helper Functions ================== **/
// Normalizer untuk input yang aman
function normKey(v, fallback) {
  return (typeof v === 'string' && v.trim().toLowerCase()) || fallback;
}

// Mapping weight yang tidak ada ke yang ada
function mapWeight(weight) {
  const weightMap = {
    // Map weight yang tidak ada ke yang tersedia
    'medium': 'semibold',     // medium -> semibold
    'bold': 'semibold',       // bold -> semibold  
    'light': 'extralight',    // light -> extralight
    'thin': 'extralight',     // thin -> extralight
    'heavy': 'semibold',      // heavy -> semibold
  };
  
  const normalizedWeight = normKey(weight, 'regular');
  const mappedWeight = weightMap[normalizedWeight] || normalizedWeight;
  
  // Cek apakah weight yang dimapping benar-benar ada
  if (!fontFiles[mappedWeight]) {
    console.warn(`Font weight "${weight}" mapped to "${mappedWeight}" but still not found, using regular`);
    return 'regular';
  }
  
  return mappedWeight;
}

/** ================= Main Component ================== **/
const BrandTextBase = forwardRef(function BrandText(
  {
    children,
    // API utama
    weight = 'regular',
    color = 'black',
    size = 'body',
    variant, // OPTIONAL: jika diisi, override size+weight
    opacity = 1,
    letterSpacing,
    // Default anchor untuk konsistensi
    anchorX = 'left',
    anchorY = 'top',
    // Debug
    renderOrder,
    // Props lain dari <Text/>
    ...props
  },
  ref
) {
  // Terapkan variant jika ada
  const final = useMemo(() => {
    if (variant && variants[variant]) {
      const v = variants[variant];
      return {
        weight: mapWeight(v.weight ?? weight),
        size: normKey(v.size ?? size, 'body'),
      };
    }
    return {
      weight: mapWeight(weight),
      size: normKey(size, 'body'),
    };
  }, [variant, weight, size]);

  // Ambil font path dengan fallback yang aman
  const fontPath = useMemo(() => {
    const path = fontFiles[final.weight];
    if (!path) {
      console.warn(`Font weight "${final.weight}" not available, using regular`);
      return fontFiles.regular;
    }
    return path;
  }, [final.weight]);

  // Ambil warna dan size
  const hexColor = useMemo(() => {
    return colorPalette[normKey(color, 'black')] || color;
  }, [color]);

  const finalFontSize = useMemo(() => {
    return fontSizes[final.size] || fontSizes.body;
  }, [final.size]);

  return (
    <Text
      ref={ref}
      font={fontPath}
      color={hexColor}
      fontSize={finalFontSize}
      anchorX={anchorX}
      anchorY={anchorY}
      letterSpacing={letterSpacing}
      renderOrder={renderOrder}
      // Material settings untuk konsistensi
      material-transparent
      material-opacity={opacity}
      material-depthWrite={false}
      material-toneMapped={false}
      {...props}
    >
      {children}
    </Text>
  );
});

// Memo untuk optimasi
const BrandText = memo(BrandTextBase);

// Export default
export default BrandText;

/** ================= Available Weights ================== **/
// HANYA weight ini yang tersedia:
// - extralight
// - regular  
// - regularitalic
// - semibold
// - semibolditalic

/** ================= Usage Examples ================== **/
/*
// Gunakan weight yang benar-benar ada:
<BrandText weight="regular">Normal text</BrandText>
<BrandText weight="semibold">Bold text</BrandText>
<BrandText weight="extralight">Light text</BrandText>

// Weight yang tidak ada akan otomatis dimapping:
<BrandText weight="medium">Akan jadi semibold</BrandText>
<BrandText weight="bold">Akan jadi semibold</BrandText>
*/