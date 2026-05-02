'use client';

import { ColorStop, Layer, GradientType } from '@/lib/gradient-utils';
import { Button } from '@/components/ui/button';
import { ColorStopEditor } from './color-stop-editor';
import { Slider } from '@/components/ui/slider';
import { Plus, Palette, Grid } from 'lucide-react';

interface ControlPanelProps {
  layer: Layer;
  onUpdateLayer: (layer: Layer) => void;
}

export function ControlPanel({
  layer,
  onUpdateLayer,
}: ControlPanelProps) {
  const isBlurOnlyLayer = layer.preset === 'blur';
  const gradient = layer.gradient!;

  const updateStop = (updatedStop: ColorStop) => {
    onUpdateLayer({
      ...layer,
      gradient: {
        ...gradient,
        stops: gradient.stops.map((s) => (s.id === updatedStop.id ? updatedStop : s)),
      }
    });
  };

  const deleteStop = (id: string) => {
    if (gradient.stops.length > 2) {
      onUpdateLayer({
        ...layer,
        gradient: {
          ...gradient,
          stops: gradient.stops.filter((s) => s.id !== id),
        }
      });
    }
  };

  const addStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#FF6B6B',
      position: 50,
      opacity: 1,
    };
    onUpdateLayer({
      ...layer,
      gradient: {
        ...gradient,
        stops: [...gradient.stops, newStop],
      }
    });
  };

  const updateGradient = (updates: Partial<typeof gradient>) => {
    onUpdateLayer({
      ...layer,
      gradient: { ...gradient, ...updates }
    });
  };

  if (isBlurOnlyLayer) {
    return (
      <div className="flex flex-col gap-6 h-full">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Layer Name</label>
          <input
            type="text"
            value={layer.name}
            onChange={(e) => onUpdateLayer({ ...layer, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">Blur: {layer.blurAmount}px</label>
            <button
              onClick={() => onUpdateLayer({ ...layer, blurEnabled: !layer.blurEnabled })}
              className={`w-8 h-4 rounded-full transition-colors relative ${layer.blurEnabled ? 'bg-blue-500' : 'bg-slate-300'
                }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${layer.blurEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
              />
            </button>
          </div>
          {layer.blurEnabled && (
            <Slider
              min={0}
              max={100}
              step={1}
              value={[layer.blurAmount]}
              onValueChange={([value]) => onUpdateLayer({ ...layer, blurAmount: value })}
              className="mt-2"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Layer Type & Name */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Layer Name</label>
          <input
            type="text"
            value={layer.name}
            onChange={(e) => onUpdateLayer({ ...layer, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Layer Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateLayer({ ...layer, type: 'gradient' })}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${layer.type === 'gradient'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <Grid className="w-4 h-4" /> Gradient
            </button>
            <button
              onClick={() => onUpdateLayer({ ...layer, type: 'color', color: layer.color || '#3b82f6' })}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${layer.type === 'color'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <Palette className="w-4 h-4" /> Color
            </button>
          </div>
        </div>
      </div>

      {/* Layer Appearance */}
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Opacity: {Math.round(layer.opacity * 100)}%</label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[layer.opacity]}
              onValueChange={([value]) => onUpdateLayer({ ...layer, opacity: value })}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Blend Mode</label>
            <select
              value={layer.blendMode}
              onChange={(e) => onUpdateLayer({ ...layer, blendMode: e.target.value as any })}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
              <option value="color-dodge">Color Dodge</option>
              <option value="color-burn">Color Burn</option>
              <option value="hard-light">Hard Light</option>
              <option value="soft-light">Soft Light</option>
              <option value="difference">Difference</option>
              <option value="hue">Hue</option>
              <option value="saturation">Saturation</option>
              <option value="color">Color</option>
              <option value="luminosity">Luminosity</option>
            </select>
          </div>
        </div>

        {/* Blur Effect */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">Blur: {layer.blurAmount}px</label>
            <button
              onClick={() => onUpdateLayer({ ...layer, blurEnabled: !layer.blurEnabled })}
              className={`w-8 h-4 rounded-full transition-colors relative ${layer.blurEnabled ? 'bg-blue-500' : 'bg-slate-300'
                }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${layer.blurEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
              />
            </button>
          </div>
          {layer.blurEnabled && (
            <Slider
              min={0}
              max={100}
              step={1}
              value={[layer.blurAmount]}
              onValueChange={([value]) => onUpdateLayer({ ...layer, blurAmount: value })}
              className="mt-2"
            />
          )}

          {/* Noise Effect */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">Noise: {layer.noiseAmount}%</label>
            <button
              onClick={() => onUpdateLayer({ ...layer, noiseEnabled: !layer.noiseEnabled })}
              className={`w-8 h-4 rounded-full transition-colors relative ${layer.noiseEnabled ? 'bg-blue-500' : 'bg-slate-300'
                }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${layer.noiseEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
              />
            </button>
          </div>
          {layer.noiseEnabled && (
            <Slider
              min={0}
              max={100}
              step={1}
              value={[layer.noiseAmount]}
              onValueChange={([value]) => onUpdateLayer({ ...layer, noiseAmount: value })}
              className="mt-2"
            />
          )}
        </div>
      </div>


      {layer.type === 'color' && (
        <div className="border-t border-slate-100 pt-4">
          <label className="text-sm font-semibold text-slate-900 mb-2 block">Layer Color</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={layer.color}
              onChange={(e) => onUpdateLayer({ ...layer, color: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={layer.color}
              onChange={(e) => onUpdateLayer({ ...layer, color: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm font-mono"
            />
          </div>
        </div>
      )}

      {layer.type === 'gradient' && gradient && (
        <div className="space-y-6 border-t border-slate-100 pt-4">
          {/* Gradient Type */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Gradient Type</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {(['linear', 'radial', 'conic', 'mesh'] as GradientType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateGradient({ type })}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase transition ${gradient.type === type
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['linear-repeating', 'radial-repeating', 'conic-repeating'] as GradientType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateGradient({ type })}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase transition ${gradient.type === type
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {type.replace('-repeating', '')} Rep.
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type Specific Controls */}
          {(gradient.type === 'linear' || gradient.type === 'linear-repeating') && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Angle: {gradient.angle}°</label>
              <Slider
                min={0}
                max={360}
                step={1}
                value={[gradient.angle]}
                onValueChange={([value]) => updateGradient({ angle: value })}
                className="mt-2"
              />
            </div>
          )}

          {(gradient.type === 'radial' || gradient.type === 'radial-repeating') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Shape</h4>
                  <div className="flex gap-1">
                    {(['circle', 'ellipse'] as const).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => updateGradient({ radialShape: shape })}
                        className={`flex-1 py-1 rounded text-[10px] font-medium transition ${gradient.radialShape === shape
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Size</h4>
                  <select
                    value={gradient.radialSize}
                    onChange={(e) => updateGradient({ radialSize: e.target.value as any })}
                    className="w-full px-1 py-1 border border-slate-200 rounded text-[10px]"
                  >
                    <option value="closest-side">Closest Side</option>
                    <option value="farthest-side">Farthest Side</option>
                    <option value="closest-corner">Closest Corner</option>
                    <option value="farthest-corner">Farthest Corner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Pos X: {gradient.radialX}%</label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[gradient.radialX]}
                    onValueChange={([value]) => updateGradient({ radialX: value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Pos Y: {gradient.radialY}%</label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[gradient.radialY]}
                    onValueChange={([value]) => updateGradient({ radialY: value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {(gradient.type === 'conic' || gradient.type === 'conic-repeating') && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Start Angle: {gradient.conicAngle}°</label>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[gradient.conicAngle]}
                  onValueChange={([value]) => updateGradient({ conicAngle: value })}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Center X: {gradient.conicX}%</label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[gradient.conicX]}
                    onValueChange={([value]) => updateGradient({ conicX: value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Center Y: {gradient.conicY}%</label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[gradient.conicY]}
                    onValueChange={([value]) => updateGradient({ conicY: value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Color Stops</h3>
              <Button
                onClick={addStop}
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1"
              >
                <Plus className="w-3 h-3" /> Add Stop
              </Button>
            </div>
            <div className="space-y-2">
              {gradient.stops
                .sort((a, b) => a.position - b.position)
                .map((stop) => (
                  <ColorStopEditor
                    key={stop.id}
                    stop={stop}
                    onUpdate={updateStop}
                    onDelete={deleteStop}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
