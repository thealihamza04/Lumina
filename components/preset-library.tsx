'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATE_PRESET_CONFIG, PRESET_GALLERY_ITEMS } from '@/lib/gradient-presets';
import { GradientTemplate, generateGradientCSSString } from '@/lib/gradient-utils';

export function PresetLibrary() {
  const [selectedPreset, setSelectedPreset] = useState<GradientTemplate>(PRESET_GALLERY_ITEMS[0]);
  const selectedConfig = TEMPLATE_PRESET_CONFIG[selectedPreset];
  const selectedPreview = selectedConfig.gradient ? generateGradientCSSString(selectedConfig.gradient) : undefined;

  return (
    <main className="min-h-screen bg-[#f8f8f8] p-4 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-md border border-black/25 bg-white p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 h-8 gap-1.5 text-xs font-bold text-slate-500">
                <Link href="/">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to editor
                </Link>
              </Button>
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                <Sparkles className="h-3 w-3" /> Preset library
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Browse popular gradients</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Select a preset to inspect the full preview first. Nothing is added to your canvas until you choose to add or remix it in the editor.
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-tight text-blue-700">
              {PRESET_GALLERY_ITEMS.length} presets
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="overflow-hidden rounded-md border border-black/25 bg-white shadow-sm">
            <div className="h-[48vh] min-h-80 border-b border-slate-200" style={{ background: selectedPreview }} />
            <div className="space-y-4 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">{selectedConfig.label}</h2>
                  <p className="text-xs font-black uppercase tracking-tight text-slate-400">
                    {selectedConfig.category} • {selectedConfig.remixes} • {selectedConfig.gradient?.type.replace('-', ' ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="gap-1.5 border-slate-300 bg-white font-black uppercase tracking-tight">
                    <Link href={`/?preset=${selectedPreset}`}>
                      Add as layer
                    </Link>
                  </Button>
                  <Button asChild className="gap-1.5 font-black uppercase tracking-tight">
                    <Link href={`/?preset=${selectedPreset}&remix=1`}>
                      <WandSparkles className="h-4 w-4" /> Remix in editor
                    </Link>
                  </Button>
                </div>
              </div>
              <p className="max-w-3xl text-sm font-medium leading-6 text-slate-500">{selectedConfig.description}</p>
            </div>
          </div>

          <aside className="rounded-md border border-black/25 bg-white p-3 shadow-sm lg:max-h-[calc(100vh-9rem)] lg:overflow-hidden">
            <div className="mb-3 px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Choose a preset to preview</h2>
            </div>
            <div className="grid gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-[calc(100vh-12rem)] lg:grid-cols-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
              {PRESET_GALLERY_ITEMS.map((presetKey) => {
                const preset = TEMPLATE_PRESET_CONFIG[presetKey];
                const preview = preset.gradient ? generateGradientCSSString(preset.gradient) : undefined;
                const isSelected = presetKey === selectedPreset;

                return (
                  <button
                    key={presetKey}
                    type="button"
                    className={`group overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md ${isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'}`}
                    onClick={() => setSelectedPreset(presetKey)}
                    aria-pressed={isSelected}
                  >
                    <div className="h-20 border-b border-slate-100 transition-transform duration-300 group-hover:scale-[1.02]" style={{ background: preview }} />
                    <div className="space-y-1.5 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-xs font-black text-slate-950">{preset.label}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">{preset.category} • {preset.remixes}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">
                          {isSelected ? 'Previewing' : 'Preview'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
