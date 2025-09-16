import { forwardRef } from 'react';
import BrandText from './BrandText.jsx';

/**
 * Large "SERVICES" headline, telentang (lying flat) so it reads from the top-down camera.
 * Adjust `scale` to control overall size without touching BrandText internals.
 */
const OurServices = forwardRef(function OurServices(
  {
    text = 'SERVICES',
    position = [13, -7, 0],
    rotation = [-Math.PI / 2, 0, 0], // telentang (flat on ground, facing up)
    scale = 2.2,                      // make it big—tweak to taste
    color = 'black',
    letterSpacing = -0.06,
    weight = 'regular',
    align = 'center',
  },
  ref
) {
  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      frustumCulled={false} // keep it visible even if bounds are quirky
    >
      <BrandText
        size="headline"
        weight={weight}
        textAlign={align}
        anchorX="center"
        color={color}
        letterSpacing={letterSpacing}
      >
        {text}
      </BrandText>
    </group>
  );
});

export default OurServices;
