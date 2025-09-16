// src/components/Experience.jsx
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { useScroll, Environment, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import IkanMerah from './IkanMerah.jsx';
import IkanHitam from './IkanHitam.jsx';
import AboutText from './AboutText.jsx';
import AboutSubtext from './AboutSubtext.jsx';
import ScrollArrowIcon from './ScrollArrowIcon.jsx';
import BrandText from './BrandText.jsx';
import RokuLogo from './RokuLogo.jsx';
import OurServices from './OurServices.jsx';
import ServicesGrid from './ServicesGrid.jsx';
import ServicesText from './ServicesText.jsx';

/* ----------------------------- Constants -------------------------------- */
// Anchor posisi & lookAt (ORIGINAL dari Anda)
const ANCHOR_POS = [
  new THREE.Vector3(0, 0, 15),  // Hero
  new THREE.Vector3(0, -2, 0),  // About
  new THREE.Vector3(15, -2, 0), // Services (panning ke kanan)
];

// LookAt untuk panning effect di About->Services (ORIGINAL dari Anda)
const ANCHOR_LOOK = [
  new THREE.Vector3(0, 0, 0),     // Hero
  new THREE.Vector3(0, -20, 0),   // About (lihat ke bawah)
  new THREE.Vector3(15, -20, 0),  // Services (parallel panning)
];

// Jalur lurus (CurvePath) - ORIGINAL dari Anda
const positionPath = new THREE.CurvePath();
positionPath.add(new THREE.LineCurve3(ANCHOR_POS[0], ANCHOR_POS[1]));
positionPath.add(new THREE.LineCurve3(ANCHOR_POS[1], ANCHOR_POS[2]));

const lookAtPath = new THREE.CurvePath();
lookAtPath.add(new THREE.LineCurve3(ANCHOR_LOOK[0], ANCHOR_LOOK[1]));
lookAtPath.add(new THREE.LineCurve3(ANCHOR_LOOK[1], ANCHOR_LOOK[2]));

// Konfigurasi kamera (ORIGINAL dari Anda)
const CAMERA_CONFIG = {
  positionCurve: positionPath,
  lookAtCurve: lookAtPath,
  heroHoldEnd: 0.20,
  heroMoveEnd: 0.52,
  servicesStart: 0.75,
};

// Split berdasarkan panjang busur (sinkron) - ORIGINAL dari Anda
const POS_L0 = ANCHOR_POS[0].distanceTo(ANCHOR_POS[1]);
const POS_L1 = ANCHOR_POS[1].distanceTo(ANCHOR_POS[2]);
const U_POS_SPLIT = POS_L0 / (POS_L0 + POS_L1);

const LOOK_L0 = ANCHOR_LOOK[0].distanceTo(ANCHOR_LOOK[1]);
const LOOK_L1 = ANCHOR_LOOK[1].distanceTo(ANCHOR_LOOK[2]);
const U_LOOK_SPLIT = LOOK_L0 / (LOOK_L0 + LOOK_L1);

// Konfigurasi teks (ORIGINAL dari Anda)
const TEXT_CONFIG = {
  lineHeight: 1.5,
  headlineYOffset: 0.6,
  subtextInitialY: -4.7,
  headlinePositions: [
    new THREE.Vector3(0, 1 * 1.5 + 0.6, 0),
    new THREE.Vector3(2, 0 + 0.6, 0),
    new THREE.Vector3(0, -1 * 1.5 + 0.6, 0),
  ],
};

// Konfigurasi ikan (ORIGINAL dari Anda)
const FISH_CONFIG = {
  orbitRadius: 8,
  orbitSpeed: 0.3,
  turnSpeed: 3,
  followHz: 6.0,
  phaseTarget: Math.PI,
  phaseStiffness: 1.6,
};

// Damping dan slew (ORIGINAL dari Anda)
const V_HOLD_MAX = 0.8;
const U_DAMP = 6.0;
const DAMP_BASE = 5;
const DAMP_HOLD = 12;
const EPS_SPLIT = 1e-3;
const snapNear = (x, t, eps = EPS_SPLIT) => (Math.abs(x - t) < eps ? t : x);

// Timing (ORIGINAL dari Anda)
const MAX_DT = 1 / 30;
const BLEND_STEP = 0.05;
const BLEND_UPDATE_MS = 50;
const LIGHT_UPDATE_T = 0.05;

// Scroll handling (ORIGINAL dari Anda)
const FAST_SCROLL_THRESHOLD = 2.0;
const ORIENTATION_LOCK_TIME = 0.5;
const SECTION_TRANSITION_THRESHOLD = 0.1;

/* ------------------------------ Utils ----------------------------------- */
const lerpAngle = (start, end, amount) => {
  const diff = (end - start + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return start + diff * amount;
};

const easeSmoothstep = (t) => t * t * (3 - 2 * t);
const expAlpha = (dt, hz) => 1 - Math.exp(-hz * dt);
const map01 = (x, a, b) => THREE.MathUtils.clamp((x - a) / Math.max(1e-6, b - a), 0, 1);

// Mapping scroll offset ke t kamera (ORIGINAL dari Anda)
const camTFromOffset = (o, cfg = CAMERA_CONFIG) => {
  if (o <= cfg.heroHoldEnd) return { t: 0.0, holdAbout: false };
  if (o <= cfg.heroMoveEnd) {
    const p = easeSmoothstep(map01(o, cfg.heroHoldEnd, cfg.heroMoveEnd));
    return { t: 0.5 * p, holdAbout: false };
  }
  if (o <= cfg.servicesStart) return { t: 0.5, holdAbout: true };
  const p = easeSmoothstep(map01(o, cfg.servicesStart, 1.0));
  return { t: 0.5 + 0.5 * p, holdAbout: false };
};

/* ----------------------------- Component --------------------------------- */
export default function Experience(props = {}) {
  // Konfigurasi dengan override dari props (ORIGINAL dari Anda)
  const config = useMemo(
    () => ({
      camera: { ...CAMERA_CONFIG, ...props.cameraConfig },
      fish: { ...FISH_CONFIG, ...props.fishConfig },
      text: { ...TEXT_CONFIG, ...props.textConfig },
    }),
    [props.cameraConfig, props.fishConfig, props.textConfig]
  );

  const { viewport, camera, clock } = useThree();
  const scroll = useScroll();

  // State dan refs (ORIGINAL dari Anda)
  const [aboutProgress, setAboutProgress] = useState(0);
  const aboutProgressRef = useRef(0);
  const h0 = useRef(), h1 = useRef(), h2 = useRef();
  const headlineRefs = [h0, h1, h2];
  const subtextRef = useRef();
  const subtextMatsRef = useRef([]);
  const aboutRef = useRef();
  const fishRefs = { red: useRef(), black: useRef() };
  const dirLightRef = useRef();
  const dirLightTargetRef = useRef();

  // Motion state (ORIGINAL dari Anda)
  const blendTRef = useRef(0);
  const prevOffset = useRef(0);
  const lastSetRef = useRef(0);
  const prevLightT = useRef(0);

  // Enhanced camera state (ORIGINAL dari Anda)
  const cameraState = useRef({
    currentPos: new THREE.Vector3(0, 0, 15),
    currentLook: new THREE.Vector3(0, 0, 0),
    targetPos: new THREE.Vector3(),
    targetLook: new THREE.Vector3(),
    uPos: 0,
    uLook: 0,
    isLocked: false,
    lockTimer: 0,
    stableQuat: new THREE.Quaternion(),
    currentSection: 'hero',
    previousSection: 'hero',
    sectionTransitionProgress: 0,
    lastSectionChange: 0,
    velocityHistory: [],
    avgVelocity: 0,
  });

  const fishStates = useRef({
    red: {
      position: new THREE.Vector3(-0.5, -1, 1),
      prevPosition: new THREE.Vector3(-0.5, -1, 1),
      pathAngle: Math.random() * Math.PI * 2,
    },
    black: {
      position: new THREE.Vector3(0.5, 1, -1),
      prevPosition: new THREE.Vector3(0.5, 1, -1),
      pathAngle: Math.random() * Math.PI * 2,
    },
  });

  // Vektor sementara (ORIGINAL dari Anda)
  const vectors = useMemo(
    () => ({
      orbitTarget: new THREE.Vector3(),
      aboutOrbitTarget: new THREE.Vector3(),
      finalTarget: new THREE.Vector3(),
      diff: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      lightTarget: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
    }),
    []
  );

  // Posisi responsif (ORIGINAL dari Anda)
  const aboutTextPosition = useMemo(
    () => new THREE.Vector3(-viewport.width / 2 + 2, -viewport.height * 2, 0),
    [viewport.width, viewport.height]
  );

  const responsiveScale = useMemo(
    () => Math.min(viewport.width / 12, 1) * 0.8,
    [viewport.width]
  );

  const aboutOrbit = useMemo(
    () => ({
      radiusX: viewport.width * 0.35,
      radiusZ: 6.0,
    }),
    [viewport.width]
  );

  const lowPerf =
    (typeof window !== 'undefined' ? window.devicePixelRatio : 1) > 1.5 ||
    viewport.width < 8;

  /* --------------------------- Effects ----------------------------------- */
  useEffect(() => {
    if (!subtextRef.current) return;
    const mats = [];
    subtextRef.current.traverse((child) => {
      if (child.material) {
        child.material.transparent = true;
        child.material.depthWrite = false;
        mats.push(child.material);
      }
    });
    subtextMatsRef.current = mats;
  }, []);

  useEffect(() => {
    headlineRefs.forEach((ref) => {
      if (ref.current?.material) ref.current.material.transparent = true;
    });
  }, []);

  useEffect(() => {
    if (dirLightRef.current && dirLightTargetRef.current) {
      dirLightRef.current.target = dirLightTargetRef.current;
      dirLightRef.current.target.updateMatrixWorld();
    }
  }, []);

  /* --------------------------- Helpers ----------------------------------- */
  const updateFish = (ref, state, blend, dt) => {
    if (!ref.current) return;

    vectors.orbitTarget.set(
      Math.cos(state.pathAngle) * config.fish.orbitRadius,
      0,
      Math.sin(state.pathAngle) * config.fish.orbitRadius
    );

    vectors.aboutOrbitTarget.set(
      Math.cos(state.pathAngle) * aboutOrbit.radiusX,
      aboutTextPosition.y + Math.sin(state.pathAngle * 2) * 0.5,
      Math.sin(state.pathAngle) * aboutOrbit.radiusZ
    );

    vectors.finalTarget.copy(vectors.orbitTarget).lerp(vectors.aboutOrbitTarget, blend);

    const followAlpha = expAlpha(dt, config.fish.followHz);
    state.prevPosition.copy(state.position);
    vectors.diff.copy(vectors.finalTarget).sub(state.position);
    state.position.addScaledVector(vectors.diff, followAlpha);

    vectors.velocity.copy(state.position).sub(state.prevPosition);
    ref.current.position.copy(state.position);

    if (vectors.velocity.lengthSq() > 1e-6) {
      const targetYaw = Math.atan2(vectors.velocity.x, vectors.velocity.z) - Math.PI / 2;
      ref.current.rotation.y = lerpAngle(ref.current.rotation.y, targetYaw, dt * config.fish.turnSpeed);
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -vectors.velocity.y * 0.1, dt * 5);
    }
  };

  // Camera update (ORIGINAL dari Anda)
  const updateCamera = (dt, offset, vel) => {
    const { t: targetT, holdAbout } = camTFromOffset(offset, config.camera);
    const holdSoft = holdAbout && Math.abs(vel) < V_HOLD_MAX;

    // Velocity smoothing
    cameraState.current.velocityHistory.push(vel);
    if (cameraState.current.velocityHistory.length > 5) {
      cameraState.current.velocityHistory.shift();
    }
    cameraState.current.avgVelocity =
      cameraState.current.velocityHistory.reduce((a, b) => a + b, 0) /
      cameraState.current.velocityHistory.length;

    // Section detection with hysteresis
    let newSection = cameraState.current.currentSection;
    const currentTime = clock.getElapsedTime();

    if (offset <= config.camera.heroMoveEnd - SECTION_TRANSITION_THRESHOLD) {
      newSection = 'hero';
    } else if (offset >= config.camera.servicesStart + SECTION_TRANSITION_THRESHOLD) {
      newSection = 'services';
    } else if (
      offset >= config.camera.heroMoveEnd + SECTION_TRANSITION_THRESHOLD &&
      offset <= config.camera.servicesStart - SECTION_TRANSITION_THRESHOLD
    ) {
      newSection = 'about';
    }

    if (newSection !== cameraState.current.currentSection) {
      cameraState.current.previousSection = cameraState.current.currentSection;
      cameraState.current.currentSection = newSection;
      cameraState.current.lastSectionChange = currentTime;
      cameraState.current.sectionTransitionProgress = 0;

      const isFastScroll = Math.abs(cameraState.current.avgVelocity) > FAST_SCROLL_THRESHOLD;
      const isServicesToAbout =
        cameraState.current.previousSection === 'services' && newSection === 'about';

      if (isServicesToAbout && isFastScroll) {
        cameraState.current.isLocked = true;
        cameraState.current.lockTimer = ORIENTATION_LOCK_TIME;
        cameraState.current.stableQuat.copy(camera.quaternion);
      }
    }

    const timeSinceTransition = currentTime - cameraState.current.lastSectionChange;
    cameraState.current.sectionTransitionProgress = Math.min(timeSinceTransition / 0.5, 1);

    if (cameraState.current.isLocked) {
      cameraState.current.lockTimer -= dt;
      if (cameraState.current.lockTimer <= 0) cameraState.current.isLocked = false;
    }

    // Compute u targets
    let uPosTarget = 0, uLookTarget = 0;
    if (offset <= config.camera.heroMoveEnd) {
      const p = map01(offset, config.camera.heroHoldEnd, config.camera.heroMoveEnd);
      uPosTarget = U_POS_SPLIT * p;
      uLookTarget = U_LOOK_SPLIT * p;
    } else if (offset <= config.camera.servicesStart) {
      uPosTarget = U_POS_SPLIT;
      uLookTarget = U_LOOK_SPLIT;
    } else {
      const p = map01(offset, config.camera.servicesStart, 1.0);
      uPosTarget = U_POS_SPLIT + (1 - U_POS_SPLIT) * p;
      uLookTarget = U_LOOK_SPLIT + (1 - U_LOOK_SPLIT) * p;
    }

    // Smooth u
    const uDamp = cameraState.current.isLocked ? 2 : U_DAMP;
    const uAlpha = 1 - Math.exp(-uDamp * dt);
    cameraState.current.uPos = THREE.MathUtils.lerp(cameraState.current.uPos, uPosTarget, uAlpha);
    cameraState.current.uLook = THREE.MathUtils.lerp(cameraState.current.uLook, uLookTarget, uAlpha);

    cameraState.current.uPos = snapNear(cameraState.current.uPos, U_POS_SPLIT);
    cameraState.current.uLook = snapNear(cameraState.current.uLook, U_LOOK_SPLIT);

    // Read from curves
    config.camera.positionCurve.getPointAt(cameraState.current.uPos, cameraState.current.targetPos);
    config.camera.lookAtCurve.getPointAt(cameraState.current.uLook, cameraState.current.targetLook);

    // Smooth position/look
    const posDamp = holdSoft ? DAMP_HOLD : DAMP_BASE;
    const posAlpha = 1 - Math.exp(-posDamp * dt);
    cameraState.current.currentPos.lerp(cameraState.current.targetPos, posAlpha);
    cameraState.current.currentLook.lerp(cameraState.current.targetLook, posAlpha);
    camera.position.copy(cameraState.current.currentPos);

    if (holdSoft) {
      cameraState.current.uPos = snapNear(cameraState.current.uPos, U_POS_SPLIT, 1e-4);
      cameraState.current.uLook = snapNear(cameraState.current.uLook, U_LOOK_SPLIT, 1e-4);
    }

    // Orientation handling (About/Services look-down consistency)
    const inAboutOrServices =
      cameraState.current.currentSection === 'about' ||
      cameraState.current.currentSection === 'services';

    if (inAboutOrServices) {
      if (cameraState.current.isLocked) {
        camera.quaternion.copy(cameraState.current.stableQuat);
      } else {
        vectors.forward.set(0, -1, 0); // down
        vectors.right.set(1, 0, 0);    // right
        vectors.up.set(0, 0, -1);      // toward user (screen)

        const matrix = new THREE.Matrix4();
        matrix.makeBasis(vectors.right, vectors.up, vectors.forward.clone().negate());
        matrix.setPosition(camera.position);

        const targetQuat = new THREE.Quaternion().setFromRotationMatrix(matrix);

        if (cameraState.current.sectionTransitionProgress < 1) {
          camera.quaternion.slerp(targetQuat, dt * 8);
        } else {
          camera.quaternion.copy(targetQuat);
        }
        cameraState.current.stableQuat.copy(camera.quaternion);
      }

      camera.up.set(0, 1, 0);
      camera.updateMatrixWorld();
    } else {
      camera.lookAt(cameraState.current.currentLook);
      camera.up.set(0, 1, 0);
    }
  };

  const updateText = (dt, offset) => {
    const headlineT = map01(offset, config.camera.heroHoldEnd, config.camera.heroMoveEnd);
    headlineRefs.forEach((ref, i) => {
      if (ref.current?.material) {
        ref.current.position.x =
          config.text.headlinePositions[i].x + (i === 1 ? headlineT * 2 : -headlineT * 2);
        ref.current.material.opacity = 1 - headlineT;
      }
    });

    const heroSubFade = map01(offset, config.camera.heroHoldEnd, config.camera.heroMoveEnd);
    if (subtextRef.current) subtextRef.current.position.y = config.text.subtextInitialY + offset * 5;
    if (aboutRef.current) aboutRef.current.position.y = Math.min(offset, config.camera.servicesStart) * -0.5;

    const fade = 1 - heroSubFade;
    subtextMatsRef.current.forEach((m) => { m.opacity = fade; });
  };

  const updateLighting = (dt, blend) => {
    vectors.lightTarget.set(0, 0, 0).lerp(aboutTextPosition, blend);
    if (dirLightTargetRef.current) {
      dirLightTargetRef.current.position.copy(vectors.lightTarget);
      dirLightTargetRef.current.updateMatrixWorld();
    }
    if (dirLightRef.current && Math.abs(prevLightT.current - blend) > LIGHT_UPDATE_T) {
      prevLightT.current = blend;
      const tight = THREE.MathUtils.lerp(60, 16, blend);
      const cam = dirLightRef.current.shadow.camera;
      cam.left = -tight; cam.right = tight; cam.top = tight; cam.bottom = -tight;
      cam.updateProjectionMatrix();
    }
  };

  /* ---------------------------- Frame loop -------------------------------- */
  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const offset = Number.isFinite(scroll.offset) ? scroll.offset : prevOffset.current;
    const vel = (offset - prevOffset.current) / Math.max(dt, 1e-3);

    // Camera
    updateCamera(dt, offset, vel);

    // Text & subtext
    updateText(dt, offset);

    // Blend (hero -> about)
    const { t: camT } = camTFromOffset(offset, config.camera);
    const heroToAbout = THREE.MathUtils.clamp(camT / 0.5, 0, 1);
    const targetBlend = easeSmoothstep(heroToAbout);
    const blendAlpha = expAlpha(dt, 8);
    blendTRef.current += (targetBlend - blendTRef.current) * blendAlpha;
    const blend = blendTRef.current;

    // Throttle setState
    const now = clock.getElapsedTime() * 1000;
    const snapped = Math.round(blend / BLEND_STEP) * BLEND_STEP;
    if (snapped !== aboutProgressRef.current && (now - lastSetRef.current) > BLEND_UPDATE_MS) {
      aboutProgressRef.current = snapped;
      setAboutProgress(snapped);
      lastSetRef.current = now;
    }

    // Fish
    const red = fishStates.current.red;
    const black = fishStates.current.black;
    const phaseK = config.fish.phaseStiffness * (1 - blend) ** 2;
    const desiredBlackAngle = red.pathAngle + config.fish.phaseTarget;
    black.pathAngle = lerpAngle(black.pathAngle, desiredBlackAngle, dt * phaseK);

    red.pathAngle += config.fish.orbitSpeed * dt * 1.0;
    black.pathAngle += config.fish.orbitSpeed * dt * 0.95;

    updateFish(fishRefs.red, red, blend, dt);
    updateFish(fishRefs.black, black, blend, dt);

    // Lighting
    updateLighting(dt, blend);

    prevOffset.current = offset;
  });

  /* ------------------------------ Layout --------------------------------- */
  const isNarrow = viewport.width < 8;
  const gutterX = isNarrow ? 0 : Math.max(3.2, viewport.width * 0.22);
  const subY = isNarrow ? aboutTextPosition.y - 1.0 : aboutTextPosition.y;

  return (
    <>
      {/* Lights + IBL */}
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.6} groundColor="#555555" />
      <directionalLight
        ref={dirLightRef}
        castShadow
        position={[5, 15, 5]}
        intensity={1.2}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
        shadow-mapSize={[lowPerf ? 512 : 1024, lowPerf ? 512 : 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={160}
      />
      <object3D ref={dirLightTargetRef} position={[0, 0, 0]} />
      <Environment preset="studio" resolution={lowPerf ? 32 : 64} intensity={0.25} />

      {/* Ground (About area) */}
      <mesh receiveShadow position-y={aboutTextPosition.y - 10} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.15} transparent />
      </mesh>

      <Suspense fallback={<BrandText color="white" size="body">Loading 3D Experience...</BrandText>}>
        <group scale={responsiveScale}>
          {/* Headline hero */}
          <BrandText ref={h0} weight="regular" size="headline" textAlign="center" anchorX="center"
            position={config.text.headlinePositions[0]} letterSpacing={-0.05}>
            Good visual
          </BrandText>
          <BrandText ref={h1} weight="regular" size="headline" textAlign="center" anchorX="center"
            position={config.text.headlinePositions[1]} letterSpacing={-0.05}>
            with tons
          </BrandText>
          <BrandText ref={h2} weight="regular" size="headline" textAlign="center" anchorX="center"
            position={config.text.headlinePositions[2]} letterSpacing={-0.05}>
            of creativity
          </BrandText>

          {/* Fish */}
          <IkanHitam ref={fishRefs.black} position={[0.5, 1, -1]} />
          <IkanMerah ref={fishRefs.red} position={[-0.5, -1, 1]} />

          {/* Subtext bar + arrow */}
          <group ref={subtextRef} position-y={config.text.subtextInitialY}>
            <group position-x={-8.0}>
              <BrandText size="micro" textAlign="left" color="gray" anchorX="left">Location</BrandText>
              <BrandText weight="regular" size="caption" color="black" position-y={-0.2} textAlign="left" anchorX="left">Tangerang</BrandText>
            </group>
            <group position-x={-4.0}>
              <BrandText size="micro" textAlign="left" color="gray" anchorX="left">Design-driven</BrandText>
              <BrandText weight="regular" size="caption" color="black" position-y={-0.2} textAlign="left" anchorX="left">Creative Agency</BrandText>
            </group>
            <group position-x={0.0}>
              <BrandText size="micro" textAlign="left" color="gray" anchorX="left">Email</BrandText>
              <BrandText weight="regular" size="caption" color="black" position-y={-0.2} textAlign="left" anchorX="left">hello@rokustudio.com</BrandText>
            </group>
            <group position-x={4.0}>
              <BrandText size="micro" textAlign="left" color="gray" anchorX="left">Made by</BrandText>
              <BrandText weight="regular" size="caption" color="black" position-y={-0.2} textAlign="left" anchorX="left">William Wijaya</BrandText>
            </group>
            <ScrollArrowIcon position-x={8.0} position-y={-0.2} />
          </group>
        </group>

        {/* ROKU LOGO */}
        <group
          position={[10, -8, 0]}
          rotation={[-Math.PI * 2, 0, 0]}
          scale={0.6}
          frustumCulled={false}
        >
          <RokuLogo />
        </group>

        {/* About block */}
        <group ref={aboutRef}>
          <AboutText position={aboutTextPosition} />
          <AboutSubtext
            position={[aboutTextPosition.x + 5 + gutterX, subY - 3, aboutTextPosition.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            text={`Brand value matters\nmore than short-term virality,\nand we focus on preserving\nthat value over time.`}
            size="body"
            variant="revealX"
            scrollProgress={aboutProgress}
            onMount={false}
          />
        </group>

        {/* Services block (big text) */}
        <OurServices
          text="SERVICES"
          position={[13, -10, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1.5}
          color="black"
        />

        {/* Services Grid */}
        <ServicesGrid
          origin={new THREE.Vector3(14, -7, 0)}
          rotation={[-Math.PI / 2, 0, 0]}
          uiScale={1}
          baseWidth={12}
          autoFit={true}
          mobileFocus={true}
          screenGapX={0.2}
          screenGapZ={0.32}
          size={[3.2, 2.0]}
        />

      </Suspense>
    </>
  );
}