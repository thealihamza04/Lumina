'use client';

import { useEffect, useRef, useState } from 'react';
import { Layer, generateGradientCSSString } from '@/lib/gradient-utils';

interface GradientPreviewProps {
  layers: Layer[];
  activeLayerId?: string;
  onSelectLayer?: (id: string) => void;
  onUpdateLayer?: (layer: Layer) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

type InteractionState = {
  mode: 'move' | 'resize';
  layerId: string;
  handle?: ResizeHandle;
  startX: number;
  startY: number;
  startLayer: Layer;
};

const DEFAULT_TRANSFORM = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function GradientPreview({ layers, activeLayerId, onSelectLayer, onUpdateLayer }: GradientPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<InteractionState | null>(null);

  useEffect(() => {
    if (!interaction || !onUpdateLayer || !previewRef.current) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = previewRef.current?.getBoundingClientRect();
      if (!rect) return;

      const deltaXPercent = ((event.clientX - interaction.startX) / rect.width) * 100;
      const deltaYPercent = ((event.clientY - interaction.startY) / rect.height) * 100;

      const start = {
        x: interaction.startLayer.x ?? DEFAULT_TRANSFORM.x,
        y: interaction.startLayer.y ?? DEFAULT_TRANSFORM.y,
        width: interaction.startLayer.width ?? DEFAULT_TRANSFORM.width,
        height: interaction.startLayer.height ?? DEFAULT_TRANSFORM.height,
      };

      let nextX = start.x;
      let nextY = start.y;
      let nextWidth = start.width;
      let nextHeight = start.height;

      if (interaction.mode === 'move') {
        nextX = clamp(start.x + deltaXPercent, 0, 100 - start.width);
        nextY = clamp(start.y + deltaYPercent, 0, 100 - start.height);
      }

      if (interaction.mode === 'resize' && interaction.handle) {
        const minSize = 5;

        if (interaction.handle.includes('e')) {
          nextWidth = clamp(start.width + deltaXPercent, minSize, 100 - start.x);
        }
        if (interaction.handle.includes('s')) {
          nextHeight = clamp(start.height + deltaYPercent, minSize, 100 - start.y);
        }
        if (interaction.handle.includes('w')) {
          const rawX = start.x + deltaXPercent;
          const maxX = start.x + start.width - minSize;
          nextX = clamp(rawX, 0, maxX);
          nextWidth = clamp(start.width - (nextX - start.x), minSize, 100 - nextX);
        }
        if (interaction.handle.includes('n')) {
          const rawY = start.y + deltaYPercent;
          const maxY = start.y + start.height - minSize;
          nextY = clamp(rawY, 0, maxY);
          nextHeight = clamp(start.height - (nextY - start.y), minSize, 100 - nextY);
        }
      }

      onUpdateLayer({
        ...interaction.startLayer,
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
      });
    };

    const handlePointerUp = () => setInteraction(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [interaction, onUpdateLayer]);

  const startMove = (event: React.PointerEvent<HTMLDivElement>, layer: Layer) => {
    if (!onUpdateLayer) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectLayer?.(layer.id);
    setInteraction({
      mode: 'move',
      layerId: layer.id,
      startX: event.clientX,
      startY: event.clientY,
      startLayer: layer,
    });
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>, layer: Layer, handle: ResizeHandle) => {
    if (!onUpdateLayer) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectLayer?.(layer.id);
    setInteraction({
      mode: 'resize',
      layerId: layer.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startLayer: layer,
    });
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      {/* Generate SVG filters for each layer with noise */}
      <svg width="0" height="0" className="absolute">
        <defs>
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

      <div ref={previewRef} className="flex-1 rounded-xl border border-slate-200 shadow-inner overflow-hidden relative bg-white touch-none">
        {/* Checkerboard background for transparency preview */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'conic-gradient(#000 0.25turn, transparent 0 0.5turn, #000 0 0.75turn, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />

        {layers.map((layer, index) => {
          if (!layer.visible) return null;

          let filterValue = 'none';
          if (layer.preset === 'blur') {
            filterValue = 'none';
          } else if (layer.blurEnabled && layer.noiseEnabled) {
            filterValue = `blur(${layer.blurAmount}px) url(#filter-noise-${layer.id})`;
          } else if (layer.blurEnabled) {
            filterValue = `blur(${layer.blurAmount}px)`;
          } else if (layer.noiseEnabled) {
            filterValue = `url(#filter-noise-${layer.id})`;
          }

          const x = layer.x ?? DEFAULT_TRANSFORM.x;
          const y = layer.y ?? DEFAULT_TRANSFORM.y;
          const width = layer.width ?? DEFAULT_TRANSFORM.width;
          const height = layer.height ?? DEFAULT_TRANSFORM.height;
          const rotation = layer.rotation ?? DEFAULT_TRANSFORM.rotation;

          const layerStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: `${width}%`,
            height: `${height}%`,
            zIndex: layers.length - index,
            transition: interaction ? 'none' : 'all 0.2s ease-in-out',
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            cursor: isActive ? 'move' : 'pointer',
            outline: isActive ? '2px solid rgba(59, 130, 246, 0.85)' : 'none',
            outlineOffset: 0,
          };

          const contentStyle: React.CSSProperties = {
            position: 'absolute',
            inset: 0,
            opacity: layer.opacity,
            mixBlendMode: layer.blendMode,
            filter: filterValue,
          };

          if (layer.preset === 'blur') {
            contentStyle.backdropFilter = `blur(${layer.blurAmount}px)`;
            contentStyle.backgroundColor = 'transparent';
          } else if (layer.type === 'gradient' && layer.gradient) {
            contentStyle.background = generateGradientCSSString(layer.gradient);
          } else {
            contentStyle.backgroundColor = layer.color;
          }

          return (
            <div
              key={layer.id}
              style={layerStyle}
              onPointerDown={(event) => startMove(event, layer)}
            >
              <div style={contentStyle} />
              {isActive && (
                <>
                  <div
                    className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nwse-resize"
                    onPointerDown={(event) => startResize(event, layer, 'nw')}
                  />
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nesw-resize"
                    onPointerDown={(event) => startResize(event, layer, 'ne')}
                  />
                  <div
                    className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nesw-resize"
                    onPointerDown={(event) => startResize(event, layer, 'sw')}
                  />
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nwse-resize"
                    onPointerDown={(event) => startResize(event, layer, 'se')}
                  />
                </>
              )}
            </div>
          );
        })}
        {selectedLayerOverlay && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedLayerOverlay.x ?? DEFAULT_TRANSFORM.x}%`,
              top: `${selectedLayerOverlay.y ?? DEFAULT_TRANSFORM.y}%`,
              width: `${selectedLayerOverlay.width ?? DEFAULT_TRANSFORM.width}%`,
              height: `${selectedLayerOverlay.height ?? DEFAULT_TRANSFORM.height}%`,
              zIndex: layers.length + 50,
              transform: `rotate(${selectedLayerOverlay.rotation ?? DEFAULT_TRANSFORM.rotation}deg)`,
              transformOrigin: 'center center',
              transition: interaction ? 'none' : 'all 0.2s ease-in-out',
              outline: '2px solid rgba(59, 130, 246, 0.85)',
              cursor: 'move',
            }}
            onPointerDown={(event) => startMove(event, selectedLayerOverlay)}
          >
            <div
              className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nwse-resize"
              onPointerDown={(event) => startResize(event, selectedLayerOverlay, 'nw')}
            />
            <div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nesw-resize"
              onPointerDown={(event) => startResize(event, selectedLayerOverlay, 'ne')}
            />
            <div
              className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nesw-resize"
              onPointerDown={(event) => startResize(event, selectedLayerOverlay, 'sw')}
            />
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm cursor-nwse-resize"
              onPointerDown={(event) => startResize(event, selectedLayerOverlay, 'se')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
