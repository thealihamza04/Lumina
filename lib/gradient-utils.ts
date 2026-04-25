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
