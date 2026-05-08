'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Check, Palette, Search, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TEMPLATE_PRESET_CONFIG, PRESET_GALLERY_ITEMS } from '@/lib/gradient-presets';
import { GradientTemplate, generateGradientCSSString } from '@/lib/gradient-utils';

const ALL_CATEGORIES = 'All';

export function PresetLibrary() {
  const [selectedPreset, setSelectedPreset] = useState<GradientTemplate>(PRESET_GALLERY_ITEMS[0]);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedConfig = TEMPLATE_PRESET_CONFIG[selectedPreset];
  const selectedPreview = selectedConfig.gradient ? generateGradientCSSString(selectedConfig.gradient) : undefined;
  const selectedStops = selectedConfig.gradient?.stops ?? [];

  const categories = useMemo(() => [
    ALL_CATEGORIES,
    ...Array.from(new Set(PRESET_GALLERY_ITEMS.map((presetKey) => TEMPLATE_PRESET_CONFIG[presetKey].category))),
  ], []);

  const filteredPresets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return PRESET_GALLERY_ITEMS.filter((presetKey) => {
      const preset = TEMPLATE_PRESET_CONFIG[presetKey];
      const matchesCategory = selectedCategory === ALL_CATEGORIES || preset.category === selectedCategory;
      const searchableText = `${preset.label} ${preset.description} ${preset.category} ${preset.gradient?.type ?? ''}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#f8f8f8_45%,#eef2ff_100%)] p-4 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/60 backdrop-blur md:p-7">
          <div className="absolute right-[-6rem] top-[-8rem] h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-1/3 h-56 w-56 rounded-full bg-fuchsia-200/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 h-8 gap-1.5 text-xs font-bold text-slate-500 hover:bg-white/70">
                <Link href="/">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to editor
                </Link>
              </Button>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">
                <Sparkles className="h-3 w-3" /> Preset library
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                Preview polished gradients before they touch your canvas.
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 md:text-base">
                Browse the full library, inspect a large preview, and choose whether to add a clean preset or send a remixed variation back to the editor.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2 text-center shadow-sm">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-black text-slate-950">{PRESET_GALLERY_ITEMS.length}</p>
                <p className="text-[9px] font-black uppercase tracking-tight text-slate-400">Presets</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-black text-slate-950">{categories.length - 1}</p>
                <p className="text-[9px] font-black uppercase tracking-tight text-slate-400">Styles</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-black text-slate-950">2</p>
                <p className="text-[9px] font-black uppercase tracking-tight text-slate-400">Actions</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200/60">
            <div className="relative h-[52vh] min-h-96 overflow-hidden border-b border-slate-200" style={{ background: selectedPreview }}>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-5 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-tight backdrop-blur">
                    {selectedConfig.category}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-tight backdrop-blur">
                    {selectedConfig.gradient?.type.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-5 p-5 md:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">{selectedConfig.label}</h2>
                  <p className="mt-1 text-xs font-black uppercase tracking-tight text-slate-400">
                    {selectedConfig.remixes} • {selectedStops.length} color stops
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="h-10 gap-1.5 border-slate-300 bg-white font-black uppercase tracking-tight hover:border-blue-300 hover:bg-blue-50">
                    <Link href={`/?preset=${selectedPreset}`}>
                      <Palette className="h-4 w-4" /> Add as layer
                    </Link>
                  </Button>
                  <Button asChild className="h-10 gap-1.5 bg-slate-950 font-black uppercase tracking-tight hover:bg-slate-800">
                    <Link href={`/?preset=${selectedPreset}&remix=1`}>
                      <WandSparkles className="h-4 w-4" /> Remix in editor
                    </Link>
                  </Button>
                </div>
              </div>

              <p className="max-w-3xl text-sm font-semibold leading-6 text-slate-500">{selectedConfig.description}</p>

              <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Palette</p>
                  <div className="mt-2 flex overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-inner">
                    {selectedStops.map((stop) => (
                      <div
                        key={stop.id}
                        className="h-8 min-w-8 flex-1 first:rounded-l-full last:rounded-r-full"
                        style={{ backgroundColor: stop.color, opacity: stop.opacity }}
                        title={`${stop.color} at ${stop.position}%`}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                  Preview first, remix when ready.
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur lg:max-h-[calc(100vh-2rem)] lg:overflow-hidden">
            <div className="sticky top-0 z-10 space-y-3 bg-white/90 pb-3 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-slate-950">Preset browser</h2>
                  <p className="text-xs font-semibold text-slate-400">{filteredPresets.length} matching presets</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">
                  Preview only
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search presets..."
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm font-semibold"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-tight transition-colors ${selectedCategory === category ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-[calc(100vh-13rem)] lg:grid-cols-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
              {filteredPresets.map((presetKey) => {
                const preset = TEMPLATE_PRESET_CONFIG[presetKey];
                const preview = preset.gradient ? generateGradientCSSString(preset.gradient) : undefined;
                const isSelected = presetKey === selectedPreset;

                return (
                  <button
                    key={presetKey}
                    type="button"
                    className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md ${isSelected ? 'border-blue-400 ring-4 ring-blue-100' : 'border-slate-200'}`}
                    onClick={() => setSelectedPreset(presetKey)}
                    aria-pressed={isSelected}
                  >
                    <div className="relative h-24 overflow-hidden border-b border-slate-100" style={{ background: preview }}>
                      {isSelected && (
                        <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-slate-950">{preset.label}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">{preset.category} • {preset.remixes}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${isSelected ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isSelected ? 'Selected' : 'Preview'}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-500">{preset.description}</p>
                    </div>
                  </button>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-black text-slate-700">No presets found</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">Try a different search or category.</p>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
