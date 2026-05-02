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
  | 'sunset-grain';

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
