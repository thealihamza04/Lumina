import { colord } from 'colord';

export type GradientType = 
  | 'linear' 
  | 'linear-repeating' 
  | 'radial' 
  | 'radial-repeating' 
  | 'conic' 
  | 'conic-repeating';

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
  opacity: number; // 0-1
}

export interface GradientState {
  type: GradientType;
  angle: number; // 0-360 for linear
  stops: ColorStop[];
  // For radial
  radialShape: 'circle' | 'ellipse';
  radialSize: 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner';
  radialX: number; // 0-100
  radialY: number; // 0-100
  // For conic
  conicAngle: number; // 0-360
  conicX: number; // 0-100
  conicY: number; // 0-100
}

export interface Layer {
  id: string;
  name: string;
  type: 'gradient' | 'color';
  gradient?: GradientState;
  color?: string;
  opacity: number;
  visible: boolean;
  blurEnabled: boolean;
  blurAmount: number;
  noiseEnabled: boolean;
  noiseAmount: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  x?: number; // 0-100
  y?: number; // 0-100
  width?: number; // 0-100
  height?: number; // 0-100
  rotation?: number; // degrees
  preset?: 'default' | 'blur' | 'noise' | 'mesh';
  meshPoint?: {
    alpha: number; // 0-1
    radius: number; // 10-80
    falloff: number; // 20-100
    groupId?: string;
  };
}

export const generateGradientCSSString = (state: GradientState): string => {
  const colorStopString = state.stops
    .sort((a, b) => a.position - b.position)
    .map(stop => {
      const color = colord(stop.color);
      const rgb = color.toRgb();
      const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${stop.opacity})`;
      return `${rgba} ${stop.position}%`;
    })
    .join(', ');

  switch (state.type) {
    case 'linear':
      return `linear-gradient(${state.angle}deg, ${colorStopString})`;
    case 'linear-repeating':
      return `repeating-linear-gradient(${state.angle}deg, ${colorStopString})`;
    case 'radial':
      return `radial-gradient(${state.radialShape} ${state.radialSize} at ${state.radialX}% ${state.radialY}%, ${colorStopString})`;
    case 'radial-repeating':
      return `repeating-radial-gradient(${state.radialShape} ${state.radialSize} at ${state.radialX}% ${state.radialY}%, ${colorStopString})`;
    case 'conic':
      return `conic-gradient(from ${state.conicAngle}deg at ${state.conicX}% ${state.conicY}%, ${colorStopString})`;
    case 'conic-repeating':
      return `repeating-conic-gradient(from ${state.conicAngle}deg at ${state.conicX}% ${state.conicY}%, ${colorStopString})`;
    default:
      return colorStopString;
  }
};

export const getDefaultGradientState = (): GradientState => ({
  type: 'linear',
  angle: 90,
  stops: [
    { id: '1', color: '#FF1493', position: 0, opacity: 1 },
    { id: '2', color: '#FFB6C1', position: 100, opacity: 1 },
  ],
  radialShape: 'circle',
  radialSize: 'farthest-corner',
  radialX: 50,
  radialY: 50,
  conicAngle: 0,
  conicX: 50,
  conicY: 50,
});

export const getDefaultLayer = (id: string = Date.now().toString()): Layer => ({
  id,
  name: `Layer ${id.slice(-3)}`,
  type: 'gradient',
  gradient: getDefaultGradientState(),
  opacity: 1,
  visible: true,
  blurEnabled: false,
  blurAmount: 0,
  noiseEnabled: false,
  noiseAmount: 20,
  blendMode: 'normal',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
  preset: 'default',
});

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export interface MeshGeneratorOptions {
  blobCount: number;
  spread: number;
  softness: number;
  gradientMode?: 'sharp-bezier' | 'soft-bezier' | 'mesh-static' | 'mesh-grid' | 'simple';
  warpShape?: 'simplex-noise' | 'circular' | 'value-noise' | 'worley-noise' | 'fbm-noise' | 'voronoi-noise' | 'domain-warping' | 'waves' | 'smooth-noise' | 'oval' | 'rows' | 'columns' | 'flat' | 'gravity';
  warpAmount?: number;
  warpSize?: number;
  noiseIntensity?: number;
}

const randomFrom = (min: number, max: number) => Math.random() * (max - min) + min;

const getHarmonizedColor = (baseHue: number, index: number, total: number) => {
  const hueShift = (360 / Math.max(total, 1)) * index;
  const hue = (baseHue + hueShift + randomFrom(-10, 10) + 360) % 360;
  const sat = clamp(70 + randomFrom(-12, 12), 45, 90);
  const light = clamp(60 + randomFrom(-10, 10), 42, 76);
  return colord({ h: hue, s: sat, l: light }).toHex();
};

export const createPseudoMeshLayers = (options: MeshGeneratorOptions): Layer[] => {
  const blobCount = clamp(Math.round(options.blobCount), 4, 8);
  const spread = clamp(options.spread, 20, 100);
  const softness = clamp(options.softness, 20, 100);
  const gradientMode = options.gradientMode ?? 'soft-bezier';
  const warpShape = options.warpShape ?? 'simplex-noise';
  const warpAmount = clamp(options.warpAmount ?? 0, 0, 100);
  const warpSize = clamp(options.warpSize ?? 50, 1, 100);
  const noiseIntensity = clamp(options.noiseIntensity ?? 0, 0, 100);
  const groupId = `mesh-${Date.now()}`;
  const baseHue = randomFrom(0, 360);
  const centerPull = (100 - spread) / 2;

  const applyWarp = (x: number, y: number, i: number) => {
    const t = (i + 1) / blobCount;
    const amp = (warpAmount / 100) * (warpSize / 16);
    switch (warpShape) {
      case 'circular': {
        const angle = t * Math.PI * 2;
        return { x: x + Math.cos(angle) * amp * 8, y: y + Math.sin(angle) * amp * 8 };
      }
      case 'rows':
        return { x, y: y + (Math.sin((x / 100) * Math.PI * 2) * amp * 6) };
      case 'columns':
        return { x: x + (Math.sin((y / 100) * Math.PI * 2) * amp * 6), y };
      case 'waves':
        return { x: x + Math.sin((y / 100) * Math.PI * 3) * amp * 10, y: y + Math.cos((x / 100) * Math.PI * 3) * amp * 10 };
      case 'oval':
        return { x: x + Math.sin(t * Math.PI * 2) * amp * 10, y: y + Math.cos(t * Math.PI * 2) * amp * 4 };
      case 'gravity':
        return { x, y: y + (t - 0.5) * amp * 14 };
      case 'flat':
        return { x, y: 50 + (y - 50) * (1 - (warpAmount / 120)) };
      default:
        return { x: x + randomFrom(-amp * 8, amp * 8), y: y + randomFrom(-amp * 8, amp * 8) };
    }
  };

  return Array.from({ length: blobCount }, (_, index) => {
    const baseRadius = gradientMode === 'simple' ? 18 : gradientMode === 'mesh-grid' ? 14 : 22;
    const radius = clamp(baseRadius + randomFrom(-6, 10), 10, 36);
    const rawX = clamp(randomFrom(centerPull, 100 - centerPull), 0, 100);
    const rawY = clamp(randomFrom(centerPull, 100 - centerPull), 0, 100);
    const warped = applyWarp(rawX, rawY, index);
    const x = clamp(warped.x, 0, 100);
    const y = clamp(warped.y, 0, 100);
    const falloff = clamp((gradientMode === 'sharp-bezier' ? softness * 0.55 : softness * 0.7), 18, 72);
    const color = getHarmonizedColor(baseHue, index, blobCount);
    const alphaBase = gradientMode === 'sharp-bezier' ? 0.62 : gradientMode === 'simple' ? 0.4 : 0.5;
    const alpha = clamp(alphaBase + randomFrom(-0.1, 0.15), 0.2, 0.9);

    return {
      id: `${Date.now()}-${index}`,
      name: `Mesh Point ${index + 1}`,
      type: 'gradient',
      gradient: {
        type: 'radial',
        angle: 0,
        stops: [
          { id: `${index}-start`, color, position: 0, opacity: alpha },
          { id: `${index}-mid`, color, position: radius, opacity: alpha * 0.42 },
          { id: `${index}-end`, color, position: Math.min(100, radius + falloff), opacity: 0 },
        ],
        radialShape: 'circle',
        radialSize: 'farthest-corner',
        radialX: x,
        radialY: y,
        conicAngle: 0,
        conicX: 50,
        conicY: 50,
      },
      opacity: 1,
      visible: true,
      blurEnabled: true,
      blurAmount: Math.round((gradientMode === 'soft-bezier' ? softness * 0.75 : softness * 0.55)),
      noiseEnabled: noiseIntensity > 8,
      noiseAmount: noiseIntensity,
      blendMode: gradientMode === 'sharp-bezier' ? 'overlay' : 'normal',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      preset: 'mesh',
      meshPoint: {
        alpha,
        radius,
        falloff,
        groupId,
      },
    };
  });
};
