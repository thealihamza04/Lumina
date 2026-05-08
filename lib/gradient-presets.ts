import { GradientTemplate, Layer, getGradientTemplateState } from '@/lib/gradient-utils';

export type TemplatePresetConfig = Partial<Layer> & {
  label: string;
  titlePrefix: string;
  description: string;
  category: string;
  remixes: string;
};

export const TEMPLATE_PRESET_CONFIG: Record<GradientTemplate, TemplatePresetConfig> = {
  'vivid-arc': { label: 'Vivid Arc', titlePrefix: 'Vivid Arc', description: 'A punchy conic rainbow for hero cards and artboards.', category: 'Hero', remixes: '2.4k remixes', gradient: getGradientTemplateState('vivid-arc'), blurEnabled: true, blurAmount: 18, noiseEnabled: false, preset: 'vivid-arc' },
  'neon-flow': { label: 'Neon Flow', titlePrefix: 'Neon Flow', description: 'Electric pinks and greens with glow-ready contrast.', category: 'Cyber', remixes: '1.9k remixes', gradient: getGradientTemplateState('neon-flow'), blurEnabled: true, blurAmount: 10, noiseEnabled: true, noiseAmount: 30, blendMode: 'screen', preset: 'neon-flow' },
  'soft-grain': { label: 'Soft Grain', titlePrefix: 'Soft Grain', description: 'Muted editorial color with a tactile film texture.', category: 'Editorial', remixes: '3.1k remixes', gradient: getGradientTemplateState('soft-grain'), blurEnabled: true, blurAmount: 28, noiseEnabled: true, noiseAmount: 48, blendMode: 'normal', preset: 'soft-grain' },
  'sunset-grain': { label: 'Sunset Grain', titlePrefix: 'Sunset Grain', description: 'Warm sunset tones balanced with cool ocean blues.', category: 'Warm', remixes: '2.7k remixes', gradient: getGradientTemplateState('sunset-grain'), blurEnabled: true, blurAmount: 16, noiseEnabled: true, noiseAmount: 42, blendMode: 'overlay', preset: 'sunset-grain' },
  'deep-diagonal': { label: 'Deep Diagonal', titlePrefix: 'Deep Diagonal', description: 'Layered midnight blues with repeating diagonal energy.', category: 'Dark', remixes: '918 remixes', gradient: getGradientTemplateState('deep-diagonal'), preset: 'deep-diagonal' },
  'amber-stripes': { label: 'Amber Stripes', titlePrefix: 'Amber Stripes', description: 'Golden bands for luxe backgrounds and accents.', category: 'Gold', remixes: '1.1k remixes', gradient: getGradientTemplateState('amber-stripes'), preset: 'amber-stripes' },
  'cool-burst': { label: 'Cool Burst', titlePrefix: 'Cool Burst', description: 'Cool conic blues for product surfaces.', category: 'Cool', remixes: '846 remixes', gradient: getGradientTemplateState('cool-burst'), preset: 'cool-burst' },
  'prism-burst': { label: 'Prism Burst', titlePrefix: 'Prism Burst', description: 'A soft prism sweep with candy-color highlights.', category: 'Colorful', remixes: '1.6k remixes', gradient: getGradientTemplateState('prism-burst'), blurEnabled: true, blurAmount: 8, preset: 'prism-burst' },
  'electric-bars': { label: 'Electric Bars', titlePrefix: 'Electric Bars', description: 'High-voltage blue and white stripes.', category: 'Pattern', remixes: '734 remixes', gradient: getGradientTemplateState('electric-bars'), noiseEnabled: true, noiseAmount: 36, preset: 'electric-bars' },
  'spectrum-bars': { label: 'Spectrum Bars', titlePrefix: 'Spectrum Bars', description: 'A bright striped spectrum made for maximal layouts.', category: 'Pattern', remixes: '1.3k remixes', gradient: getGradientTemplateState('spectrum-bars'), noiseEnabled: true, noiseAmount: 46, preset: 'spectrum-bars' },
  'gold-beam': { label: 'Gold Beam', titlePrefix: 'Gold Beam', description: 'Dramatic black-to-gold beams with premium shine.', category: 'Gold', remixes: '1.4k remixes', gradient: getGradientTemplateState('gold-beam'), blurEnabled: true, blurAmount: 14, preset: 'gold-beam' },
  'rose-wave': { label: 'Rose Wave', titlePrefix: 'Rose Wave', description: 'Rose, violet, and airy blue for soft landing pages.', category: 'Pastel', remixes: '2.2k remixes', gradient: getGradientTemplateState('rose-wave'), blurEnabled: true, blurAmount: 20, preset: 'rose-wave' },
  'quad-fade': { label: 'Quad Fade', titlePrefix: 'Quad Fade', description: 'A balanced four-color radial fade for UI depth.', category: 'Balanced', remixes: '968 remixes', gradient: getGradientTemplateState('quad-fade'), preset: 'quad-fade' },
  'cinema-slats': { label: 'Cinema Slats', titlePrefix: 'Cinema Slats', description: 'Moody cinematic slats with teal and coral cuts.', category: 'Film', remixes: '689 remixes', gradient: getGradientTemplateState('cinema-slats'), blurEnabled: true, blurAmount: 6, noiseEnabled: true, noiseAmount: 30, preset: 'cinema-slats' },
};

export const PRESET_GALLERY_ITEMS = Object.keys(TEMPLATE_PRESET_CONFIG) as GradientTemplate[];

export const isGradientTemplatePreset = (preset: string): preset is GradientTemplate => (
  preset in TEMPLATE_PRESET_CONFIG
);
