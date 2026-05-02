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
  preset?: 'default' | 'blur' | 'noise';
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

  const interpolationMode = 'in oklab';

  switch (state.type) {
    case 'linear':
      return `linear-gradient(${interpolationMode} ${state.angle}deg, ${colorStopString})`;
    case 'linear-repeating':
      return `repeating-linear-gradient(${interpolationMode} ${state.angle}deg, ${colorStopString})`;
    case 'radial':
      return `radial-gradient(${interpolationMode} ${state.radialShape} ${state.radialSize} at ${state.radialX}% ${state.radialY}%, ${colorStopString})`;
    case 'radial-repeating':
      return `repeating-radial-gradient(${interpolationMode} ${state.radialShape} ${state.radialSize} at ${state.radialX}% ${state.radialY}%, ${colorStopString})`;
    case 'conic':
      return `conic-gradient(${interpolationMode} from ${state.conicAngle}deg at ${state.conicX}% ${state.conicY}%, ${colorStopString})`;
    case 'conic-repeating':
      return `repeating-conic-gradient(${interpolationMode} from ${state.conicAngle}deg at ${state.conicX}% ${state.conicY}%, ${colorStopString})`;
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

export type GradientTemplate =
  | 'vivid-arc'
  | 'neon-flow'
  | 'soft-grain'
  | 'sunset-grain'
  | 'deep-diagonal'
  | 'amber-stripes'
  | 'cool-burst'
  | 'prism-burst'
  | 'electric-bars'
  | 'spectrum-bars'
  | 'gold-beam'
  | 'rose-wave'
  | 'quad-fade'
  | 'cinema-slats';

export const getGradientTemplateState = (template: GradientTemplate): GradientState => {
  switch (template) {
    case 'vivid-arc':
      return {
        ...getDefaultGradientState(),
        type: 'conic',
        conicAngle: 210,
        conicX: 52,
        conicY: 68,
        stops: [
          { id: '1', color: '#ff3ca6', position: 0, opacity: 1 },
          { id: '2', color: '#48d5ff', position: 27, opacity: 1 },
          { id: '3', color: '#ffd166', position: 52, opacity: 0.9 },
          { id: '4', color: '#b65cff', position: 77, opacity: 0.95 },
          { id: '5', color: '#ff8fab', position: 100, opacity: 1 },
        ],
      };
    case 'neon-flow':
      return {
        ...getDefaultGradientState(),
        type: 'linear',
        angle: 102,
        stops: [
          { id: '1', color: '#071a14', position: 0, opacity: 1 },
          { id: '2', color: '#ff007f', position: 28, opacity: 0.95 },
          { id: '3', color: '#00d06b', position: 52, opacity: 0.95 },
          { id: '4', color: '#5ee7ff', position: 72, opacity: 0.9 },
          { id: '5', color: '#8f00ff', position: 100, opacity: 1 },
        ],
      };
    case 'soft-grain':
      return {
        ...getDefaultGradientState(),
        type: 'radial',
        radialShape: 'circle',
        radialSize: 'farthest-corner',
        radialX: 58,
        radialY: 32,
        stops: [
          { id: '1', color: '#f6c1c0', position: 0, opacity: 1 },
          { id: '2', color: '#8db6db', position: 38, opacity: 0.9 },
          { id: '3', color: '#4b5c51', position: 68, opacity: 0.75 },
          { id: '4', color: '#f2ede7', position: 100, opacity: 1 },
        ],
      };
    case 'sunset-grain':
      return {
        ...getDefaultGradientState(),
        type: 'radial',
        radialShape: 'circle',
        radialSize: 'farthest-corner',
        radialX: 54,
        radialY: 55,
        stops: [
          { id: '1', color: '#ff8d38', position: 0, opacity: 0.95 },
          { id: '2', color: '#10a5c5', position: 45, opacity: 0.92 },
          { id: '3', color: '#f2b536', position: 73, opacity: 0.9 },
          { id: '4', color: '#6f84d8', position: 100, opacity: 0.88 },
        ],
      };
    case 'deep-diagonal':
      return {
        ...getDefaultGradientState(),
        type: 'linear-repeating',
        angle: 45,
        stops: [
          { id: '1', color: '#3f3700', position: 0, opacity: 1 },
          { id: '2', color: '#3b3b5c', position: 25, opacity: 1 },
          { id: '3', color: '#32439e', position: 50, opacity: 1 },
          { id: '4', color: '#2942c7', position: 75, opacity: 1 },
          { id: '5', color: '#223dd6', position: 100, opacity: 1 },
        ],
      };
    case 'amber-stripes':
      return {
        ...getDefaultGradientState(),
        type: 'linear-repeating',
        angle: 90,
        stops: [
          { id: '1', color: '#d4c37f', position: 0, opacity: 1 },
          { id: '2', color: '#d29a17', position: 25, opacity: 1 },
          { id: '3', color: '#c46b00', position: 50, opacity: 1 },
          { id: '4', color: '#a70b00', position: 75, opacity: 1 },
          { id: '5', color: '#8b0000', position: 100, opacity: 1 },
        ],
      };
    case 'cool-burst':
      return {
        ...getDefaultGradientState(),
        type: 'conic',
        conicAngle: 20,
        conicX: 50,
        conicY: 50,
        stops: [
          { id: '1', color: '#91a2b2', position: 0, opacity: 1 },
          { id: '2', color: '#7d9bb8', position: 20, opacity: 1 },
          { id: '3', color: '#668ab0', position: 40, opacity: 1 },
          { id: '4', color: '#a6a4a8', position: 60, opacity: 1 },
          { id: '5', color: '#5e6a99', position: 80, opacity: 1 },
          { id: '6', color: '#5a79a3', position: 100, opacity: 1 },
        ],
      };
    case 'prism-burst':
      return {
        ...getDefaultGradientState(),
        type: 'conic',
        conicAngle: 200,
        conicX: 50,
        conicY: 50,
        stops: [
          { id: '1', color: '#ff46b4', position: 0, opacity: 1 },
          { id: '2', color: '#8ce0a0', position: 18, opacity: 0.95 },
          { id: '3', color: '#ffc85f', position: 35, opacity: 0.95 },
          { id: '4', color: '#d18fe7', position: 50, opacity: 0.95 },
          { id: '5', color: '#5a5bff', position: 67, opacity: 0.92 },
          { id: '6', color: '#6c5364', position: 82, opacity: 0.95 },
          { id: '7', color: '#f7d0b7', position: 100, opacity: 1 },
        ],
      };
    case 'electric-bars':
      return {
        ...getDefaultGradientState(),
        type: 'linear-repeating',
        angle: 90,
        stops: [
          { id: '1', color: '#2d2dff', position: 0, opacity: 1 },
          { id: '2', color: '#f5f6fa', position: 30, opacity: 1 },
          { id: '3', color: '#2d2dff', position: 60, opacity: 1 },
          { id: '4', color: '#f5f6fa', position: 100, opacity: 1 },
        ],
      };
    case 'spectrum-bars':
      return {
        ...getDefaultGradientState(),
        type: 'linear-repeating',
        angle: 90,
        stops: [
          { id: '1', color: '#ff5f5f', position: 0, opacity: 1 },
          { id: '2', color: '#78ecff', position: 22, opacity: 1 },
          { id: '3', color: '#ffe16f', position: 45, opacity: 1 },
          { id: '4', color: '#b67dff', position: 72, opacity: 1 },
          { id: '5', color: '#f9f9f9', position: 100, opacity: 1 },
        ],
      };
    case 'gold-beam':
      return {
        ...getDefaultGradientState(),
        type: 'linear-repeating',
        angle: 45,
        stops: [
          { id: '1', color: '#000000', position: 0, opacity: 1 },
          { id: '2', color: '#5b4c00', position: 22, opacity: 1 },
          { id: '3', color: '#f0cc00', position: 50, opacity: 1 },
          { id: '4', color: '#7d6500', position: 78, opacity: 1 },
          { id: '5', color: '#000000', position: 100, opacity: 1 },
        ],
      };
    case 'rose-wave':
      return {
        ...getDefaultGradientState(),
        type: 'linear',
        angle: 80,
        stops: [
          { id: '1', color: '#cf2a3f', position: 0, opacity: 1 },
          { id: '2', color: '#6f42f5', position: 35, opacity: 0.95 },
          { id: '3', color: '#d8dcff', position: 62, opacity: 0.95 },
          { id: '4', color: '#d14f7f', position: 100, opacity: 0.95 },
        ],
      };
    case 'quad-fade':
      return {
        ...getDefaultGradientState(),
        type: 'radial',
        radialShape: 'circle',
        radialSize: 'farthest-corner',
        radialX: 52,
        radialY: 48,
        stops: [
          { id: '1', color: '#eea382', position: 0, opacity: 0.95 },
          { id: '2', color: '#eb0042', position: 32, opacity: 0.95 },
          { id: '3', color: '#e7d49a', position: 64, opacity: 0.95 },
          { id: '4', color: '#7fb1a9', position: 100, opacity: 0.95 },
        ],
      };
    case 'cinema-slats':
      return {
        ...getDefaultGradientState(),
        type: 'linear-repeating',
        angle: 45,
        stops: [
          { id: '1', color: '#0e0f14', position: 0, opacity: 1 },
          { id: '2', color: '#303347', position: 22, opacity: 1 },
          { id: '3', color: '#f5f5f5', position: 52, opacity: 1 },
          { id: '4', color: '#7ab3b6', position: 76, opacity: 1 },
          { id: '5', color: '#ff7b62', position: 100, opacity: 1 },
        ],
      };
  }
};

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
