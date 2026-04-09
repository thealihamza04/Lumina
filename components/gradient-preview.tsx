'use client';

import { Layer, generateGradientCSSString } from '@/lib/gradient-utils';

interface GradientPreviewProps {
  layers: Layer[];
}

export function GradientPreview({ layers }: GradientPreviewProps) {
  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      {/* Generate SVG filters for each layer with noise */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {layers.map((layer) => {
            if (!layer.noiseEnabled) return null;

            // Convert noiseAmount (0-100) to opacity (0-1)
            const frequency = 0.5 + (layer.noiseAmount / 200); // 0.5-0.75

            return (
              <filter key={`noise-${layer.id}`} id={`filter-noise-${layer.id}`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency={frequency}
                  numOctaves="8"
                  result="noise"
                  seed={layers.indexOf(layer) + 1}
                />
                <feColorMatrix
                  in="noise"
                  type="saturate"
                  values="0"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="noise"
                  mode="overlay"
                />
              </filter>
            );
          })}
        </defs>
      </svg>

      <div className="flex-1 rounded-xl border border-slate-200 shadow-inner overflow-hidden relative bg-white">
        {/* Checkerboard background for transparency preview */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'conic-gradient(#000 0.25turn, transparent 0 0.5turn, #000 0 0.75turn, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Render layers in reverse order (bottom to top) */}
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

          const layerStyle: React.CSSProperties = {
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
    </div>
  );
}



