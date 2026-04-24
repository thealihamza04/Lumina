'use client';

import type { CSSProperties } from 'react';
import { Layer, generateGradientCSSString } from '@/lib/gradient-utils';
import {
  getOverlayOpacity,
  getSurfaceFilter,
  getSurfaceTransform,
  getVignetteStops,
  getWarpFrequency,
  getWarpScale,
} from '@/lib/effects';
import type { CompositionEffects } from '@/lib/effects';

interface GradientPreviewProps {
  layers: Layer[];
  effects: CompositionEffects;
}

export function GradientPreview({ layers, effects }: GradientPreviewProps) {
  const vignetteStops = getVignetteStops(effects);

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="composition-warp-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={getWarpFrequency(effects)}
              numOctaves={Math.max(1, Math.round(effects.noiseScale * 2))}
              seed={11}
              result="warpNoise"
            >
              <animate
                attributeName="seed"
                values="1;2;3;4;5;6;7;8;9"
                dur={`${Math.max(1, 12 / Math.max(0.1, effects.timeSpeed * effects.warpSpeed))}s`}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="warpNoise"
              scale={getWarpScale(effects)}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {layers.map((layer) => {
            if (!layer.noiseEnabled) return null;

            const frequency = 0.5 + (layer.noiseAmount / 200);

            return (
              <filter key={`noise-${layer.id}`} id={`filter-noise-${layer.id}`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency={frequency}
                  numOctaves="8"
                  result="noise"
                  seed={layers.indexOf(layer) + 1}
                />
                <feColorMatrix in="noise" type="saturate" values="0" />
                <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
              </filter>
            );
          })}
        </defs>
      </svg>

      <div className="flex-1 rounded-xl border border-slate-200 shadow-inner overflow-hidden relative bg-white">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'conic-gradient(#000 0.25turn, transparent 0 0.5turn, #000 0 0.75turn, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: getSurfaceTransform(effects),
            filter: `${getSurfaceFilter(effects)} url(#composition-warp-filter)`,
            transformOrigin: `calc(50% + ${effects.centerOffsetX}px) calc(50% + ${effects.centerOffsetY}px)`,
            transition: 'all 0.15s ease-out',
          }}
        >
          {[...layers].reverse().map((layer) => {
            if (!layer.visible) return null;

            let filterValue = 'none';
            if (layer.blurEnabled && layer.noiseEnabled) {
              filterValue = `blur(${layer.blurAmount}px) url(#filter-noise-${layer.id})`;
            } else if (layer.blurEnabled) {
              filterValue = `blur(${layer.blurAmount}px)`;
            } else if (layer.noiseEnabled) {
              filterValue = `url(#filter-noise-${layer.id})`;
            }

            const layerStyle: CSSProperties = {
              position: 'absolute',
              inset: 0,
              opacity: layer.opacity,
              mixBlendMode: layer.blendMode,
              filter: filterValue,
              zIndex: layers.indexOf(layer),
              transition: 'all 0.2s ease-in-out',
            };

            if (layer.type === 'gradient' && layer.gradient) {
              layerStyle.background = generateGradientCSSString(layer.gradient);
            } else {
              layerStyle.backgroundColor = layer.color;
            }

            return (
              <div
                key={layer.id}
                style={layerStyle}
                className="pointer-events-none"
              />
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            opacity: getOverlayOpacity(effects),
            backgroundImage:
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.35), rgba(0,0,0,0) 55%)',
            backgroundSize: `${180 / effects.grainScale}px ${180 / effects.grainScale}px`,
            animation: effects.grainAnimated ? `grain-shift ${Math.max(3, 9 / effects.timeSpeed)}s steps(8) infinite` : undefined,
          }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${effects.blendAngle}deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) ${vignetteStops.inner}%, rgba(0,0,0,0.22) ${vignetteStops.outer}%, rgba(0,0,0,0.35) 100%)`,
            mixBlendMode: 'soft-light',
          }}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,1), rgba(255,255,255,1))',
            mixBlendMode: 'screen',
            opacity: Math.max(0, Math.min(1, 1 - 1 / Math.max(0.2, effects.gamma))),
          }}
        />
      </div>
    </div>
  );
}
