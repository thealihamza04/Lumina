export interface CompositionEffects {
  timeSpeed: number;
  colorBalance: number;
  warpStrength: number;
  warpFrequency: number;
  warpSpeed: number;
  warpAmplitude: number;
  blendAngle: number;
  blendSoftness: number;
  rotationAmount: number;
  noiseScale: number;
  grainAmount: number;
  grainScale: number;
  grainAnimated: boolean;
  contrast: number;
  gamma: number;
  saturation: number;
  centerOffsetX: number;
  centerOffsetY: number;
  zoom: number;
}

export const DEFAULT_COMPOSITION_EFFECTS: CompositionEffects = {
  timeSpeed: 3.15,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 1,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.1,
  grainScale: 2,
  grainAnimated: true,
  contrast: 1.5,
  gamma: 1,
  saturation: 0.75,
  centerOffsetX: 0,
  centerOffsetY: 0,
  zoom: 0.9,
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getWarpFrequency = (effects: CompositionEffects): number => {
  const normalized = clamp(effects.warpFrequency, 0, 10);
  return 0.002 + normalized * 0.0018;
};

export const getWarpScale = (effects: CompositionEffects): number => {
  return clamp(effects.warpStrength * effects.warpAmplitude, 0, 200);
};

export const getSurfaceFilter = (effects: CompositionEffects): string => {
  const hue = effects.colorBalance * 45;
  const brightness = clamp(1 + effects.colorBalance * 0.2, 0.7, 1.3);
  return [
    `contrast(${clamp(effects.contrast, 0.2, 3)})`,
    `saturate(${clamp(effects.saturation, 0, 3)})`,
    `brightness(${brightness})`,
    `hue-rotate(${hue}deg)`,
  ].join(' ');
};

export const getSurfaceTransform = (effects: CompositionEffects): string => {
  const rotation = (effects.rotationAmount / 1000) * 6;
  return `translate(${effects.centerOffsetX}px, ${effects.centerOffsetY}px) scale(${effects.zoom}) rotate(${rotation}deg)`;
};

export const getOverlayOpacity = (effects: CompositionEffects): number => {
  return clamp(effects.grainAmount, 0, 1);
};

export const getVignetteStops = (effects: CompositionEffects): { inner: number; outer: number } => {
  const softness = clamp(effects.blendSoftness, 0, 1);
  return {
    inner: 35 + softness * 20,
    outer: 80 + softness * 15,
  };
};
