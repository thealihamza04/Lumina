import { colord } from 'colord';

export type GradientType = 
  | 'linear' 
  | 'linear-repeating' 
  | 'radial' 
  | 'radial-repeating' 
  | 'conic' 
  | 'conic-repeating'
  | 'mesh'
  | 'aurora'
  | 'sunburst'
  | 'waves';

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


const buildRgba = (hex: string, opacity: number) => {
  const rgb = colord(hex).toRgb();
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

export const generateGradientCSSString = (state: GradientState): string => {
  const colorStopString = state.stops
    .sort((a, b) => a.position - b.position)
    .map(stop => {
      const rgba = buildRgba(stop.color, stop.opacity);
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
    case 'mesh': {
      const meshLayers = state.stops
        .sort((a, b) => a.position - b.position)
        .map((stop, index, allStops) => {
          const x = stop.position;
          const y = 20 + ((index % 4) * 20) + (index % 2 === 0 ? 0 : 10);
          const spread = Math.max(35, 75 - (allStops.length * 3));
          return `radial-gradient(circle at ${x}% ${Math.min(y, 90)}%, ${buildRgba(stop.color, stop.opacity)} 0%, ${buildRgba(stop.color, Math.max(0, stop.opacity * 0.2))} ${spread}%, transparent 100%)`;
        })
        .join(', ');
      return meshLayers;
    }
    case 'aurora': {
      const sortedStops = [...state.stops].sort((a, b) => a.position - b.position);
      const layers = sortedStops.map((stop, index) => {
        const y = 15 + ((index * 17) % 70);
        return `radial-gradient(120% 80% at ${stop.position}% ${y}%, ${buildRgba(stop.color, stop.opacity)} 0%, transparent 70%)`;
      });
      layers.push(`linear-gradient(${interpolationMode} ${state.angle}deg, ${colorStopString})`);
      return layers.join(', ');
    }
    case 'sunburst':
      return `repeating-conic-gradient(${interpolationMode} from ${state.conicAngle}deg at ${state.conicX}% ${state.conicY}%, ${colorStopString})`;
    case 'waves':
      return `repeating-radial-gradient(${interpolationMode} circle at ${state.radialX}% ${state.radialY}%, ${colorStopString})`;
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
