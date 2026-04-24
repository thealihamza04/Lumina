'use client';

import { Slider } from '@/components/ui/slider';
import type { CompositionEffects } from '@/lib/effects';

interface CompositionEffectsPanelProps {
  effects: CompositionEffects;
  onChange: (effects: CompositionEffects) => void;
}

interface SliderControl {
  key: keyof CompositionEffects;
  label: string;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
}

const sliderControls: SliderControl[] = [
  { key: 'timeSpeed', label: 'Time Speed', min: 0, max: 10, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'colorBalance', label: 'Color Balance', min: -1, max: 1, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'warpStrength', label: 'Warp Strength', min: 0, max: 10, step: 0.1 },
  { key: 'warpFrequency', label: 'Warp Frequency', min: 0, max: 10, step: 0.1 },
  { key: 'warpSpeed', label: 'Warp Speed', min: 0, max: 5, step: 0.1 },
  { key: 'warpAmplitude', label: 'Warp Amplitude', min: 0, max: 100, step: 1 },
  { key: 'blendAngle', label: 'Blend Angle', min: 0, max: 360, step: 1 },
  { key: 'blendSoftness', label: 'Blend Softness', min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'rotationAmount', label: 'Rotation Amount', min: 0, max: 1000, step: 1 },
  { key: 'noiseScale', label: 'Noise Scale', min: 0.2, max: 8, step: 0.1, format: (v) => v.toFixed(1) },
  { key: 'grainAmount', label: 'Grain Amount', min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'grainScale', label: 'Grain Scale', min: 0.2, max: 8, step: 0.1, format: (v) => v.toFixed(1) },
  { key: 'contrast', label: 'Contrast', min: 0.2, max: 3, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'gamma', label: 'Gamma', min: 0.2, max: 3, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'saturation', label: 'Saturation', min: 0, max: 3, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'centerOffsetX', label: 'Center Offset X', min: -200, max: 200, step: 1 },
  { key: 'centerOffsetY', label: 'Center Offset Y', min: -200, max: 200, step: 1 },
  { key: 'zoom', label: 'Zoom', min: 0.25, max: 2, step: 0.01, format: (v) => v.toFixed(2) },
];

export function CompositionEffectsPanel({ effects, onChange }: CompositionEffectsPanelProps) {
  const updateValue = (key: keyof CompositionEffects, value: number | boolean) => {
    onChange({
      ...effects,
      [key]: value,
    });
  };

  return (
    <div className="rounded-xl border border-[#2e2a4b] bg-[#0f0c1e]/95 p-3 shadow-[0_20px_60px_rgba(10,7,35,0.45)]">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {sliderControls.map((control) => {
          const rawValue = effects[control.key] as number;
          const valueLabel = control.format ? control.format(rawValue) : String(rawValue);
          return (
            <div key={control.key} className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-slate-300">{control.label}</label>
                <span className="text-xs font-semibold tabular-nums text-slate-100">{valueLabel}</span>
              </div>
              <Slider
                min={control.min}
                max={control.max}
                step={control.step}
                value={[rawValue]}
                onValueChange={([value]) => updateValue(control.key, value)}
              />
            </div>
          );
        })}

        <div className="rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-slate-300">Grain Animated</label>
            <button
              type="button"
              onClick={() => updateValue('grainAnimated', !effects.grainAnimated)}
              className={`relative h-6 w-11 rounded-full transition ${effects.grainAnimated ? 'bg-violet-500' : 'bg-slate-600'}`}
              aria-pressed={effects.grainAnimated}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${effects.grainAnimated ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Animate grain overlay for a subtle motion texture.</p>
        </div>
      </div>
    </div>
  );
}
