'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { Layer, getDefaultLayer, getGradientTemplateState, GradientTemplate, generateGradientCSSString } from '@/lib/gradient-utils';
import { ControlPanel } from './control-panel';
import { GradientPreview } from './gradient-preview';
import { CSSExport } from './css-export';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  Plus,
  ChevronDown,
  GripVertical,
  Layers,
  Trash2,
  Eye,
  EyeOff,
  Settings2,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type TemplatePresetConfig = Partial<Layer> & {
  label: string;
  titlePrefix: string;
  description: string;
  category: string;
  remixes: string;
};

const TEMPLATE_PRESET_CONFIG: Record<GradientTemplate, TemplatePresetConfig> = {
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

const PRESET_GALLERY_ITEMS = Object.keys(TEMPLATE_PRESET_CONFIG) as GradientTemplate[];

const arrayMove = <T,>(items: T[], from: number, to: number): T[] => {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export function GradientEditor() {
  const [layers, setLayers] = useState<Layer[]>([
    getDefaultLayer('1'),
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<'layers' | 'gallery'>('layers');
  const [activeDragLayerId, setActiveDragLayerId] = useState<string | null>(null);
  const [overLayerId, setOverLayerId] = useState<string | null>(null);
  const [pointerY, setPointerY] = useState<number | null>(null);
  const [dragGhost, setDragGhost] = useState<{
    left: number;
    width: number;
    height: number;
    offsetY: number;
  } | null>(null);
  const layerRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const selectedLayer = layers.find(l => l.id === activeLayerId);

  const resetLayers = () => {
    const defaultLayer = getDefaultLayer('1');
    setLayers([defaultLayer]);
    setActiveLayerId('1');
    setSidebarView('layers');
  };

  const buildLayerFromPreset = (preset: 'default' | 'blur' | 'noise' | GradientTemplate = 'default', remix = false) => {
    const newLayer = getDefaultLayer();
    if (preset === 'blur') {
      newLayer.name = `Blur ${newLayer.name}`;
      newLayer.blurEnabled = true;
      newLayer.blurAmount = 36;
      newLayer.noiseEnabled = false;
      newLayer.preset = 'blur';
    }
    if (preset === 'noise') {
      newLayer.name = `Noise ${newLayer.name}`;
      newLayer.type = 'color';
      newLayer.gradient = undefined;
      newLayer.color = 'transparent';
      newLayer.blurEnabled = false;
      newLayer.noiseEnabled = true;
      newLayer.noiseAmount = 55;
      newLayer.opacity = 1;
      newLayer.blendMode = 'normal';
      newLayer.preset = 'noise';
    }
    if (preset in TEMPLATE_PRESET_CONFIG) {
      const template = TEMPLATE_PRESET_CONFIG[preset as GradientTemplate];
      const gradient = template.gradient ? { ...template.gradient, stops: template.gradient.stops.map((stop) => ({ ...stop })) } : undefined;
      Object.assign(newLayer, {
        ...(template.blurAmount !== undefined ? { blurAmount: template.blurAmount } : {}),
        ...(template.blurEnabled !== undefined ? { blurEnabled: template.blurEnabled } : {}),
        ...(template.blendMode !== undefined ? { blendMode: template.blendMode } : {}),
        ...(gradient ? { gradient } : {}),
        ...(template.noiseAmount !== undefined ? { noiseAmount: template.noiseAmount } : {}),
        ...(template.noiseEnabled !== undefined ? { noiseEnabled: template.noiseEnabled } : {}),
        ...(template.preset ? { preset: template.preset } : {}),
      });
      newLayer.name = `${remix ? 'Remix' : template.titlePrefix} ${newLayer.name}`;

      if (remix && newLayer.gradient) {
        const directionShift = Math.floor(Math.random() * 71) - 35;
        newLayer.gradient = {
          ...newLayer.gradient,
          angle: (newLayer.gradient.angle + directionShift + 360) % 360,
          conicAngle: (newLayer.gradient.conicAngle + directionShift + 360) % 360,
          radialX: Math.min(72, Math.max(28, newLayer.gradient.radialX + Math.floor(Math.random() * 21) - 10)),
          radialY: Math.min(72, Math.max(28, newLayer.gradient.radialY + Math.floor(Math.random() * 21) - 10)),
          stops: newLayer.gradient.stops.map((stop, index) => ({
            ...stop,
            id: `${index + 1}`,
            position: Math.min(100, Math.max(0, stop.position + Math.floor(Math.random() * 11) - 5)),
          })),
        };
        newLayer.blurAmount = Math.max(0, newLayer.blurAmount + Math.floor(Math.random() * 9) - 4);
        newLayer.noiseAmount = Math.min(70, Math.max(10, newLayer.noiseAmount + Math.floor(Math.random() * 15) - 7));
      }
    }
    return newLayer;
  };

  const addLayer = (preset: 'default' | 'blur' | 'noise' | GradientTemplate = 'default') => {
    const newLayer = buildLayerFromPreset(preset);
    setLayers((prevLayers) => [newLayer, ...prevLayers]);
    setActiveLayerId(newLayer.id);
    setSidebarView('layers');
    setIsSettingsOpen(true);
  };

  const remixPreset = (preset: GradientTemplate) => {
    const newLayer = buildLayerFromPreset(preset, true);
    setLayers((prevLayers) => [newLayer, ...prevLayers]);
    setActiveLayerId(newLayer.id);
    setSidebarView('layers');
    setIsSettingsOpen(true);
  };

  const deleteLayer = (id: string) => {
    if (layers.length > 1) {
      setLayers((prevLayers) => {
        const newLayers = prevLayers.filter(l => l.id !== id);
        if (activeLayerId === id && newLayers.length > 0) {
          setActiveLayerId(newLayers[0].id);
        }
        return newLayers;
      });
    }
  };

  const updateLayer = (updatedLayer: Layer) => {
    setLayers((prevLayers) => prevLayers.map(l => l.id === updatedLayer.id ? updatedLayer : l));
  };

  const toggleVisibility = (id: string) => {
    setLayers((prevLayers) => prevLayers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const reorderLayers = (draggedId: string, targetId: string) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    setLayers((prevLayers) => {
      const draggedIndex = prevLayers.findIndex((l) => l.id === draggedId);
      const targetIndex = prevLayers.findIndex((l) => l.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prevLayers;
      return arrayMove(prevLayers, draggedIndex, targetIndex);
    });
  };

  const getLayerIdByPointer = (y: number) => {
    let closestId: string | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const layer of layers) {
      const row = layerRowRefs.current[layer.id];
      if (!row) continue;
      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const distance = Math.abs(y - midY);
      if (distance < minDistance) {
        minDistance = distance;
        closestId = layer.id;
      }
    }

    return closestId;
  };

  const handleLayerPointerDown = (event: ReactPointerEvent<HTMLDivElement>, layerId: string) => {
    if (event.button !== 0) return;
    const row = layerRowRefs.current[layerId];
    if (!row) return;

    event.preventDefault();

    const rect = row.getBoundingClientRect();
    setActiveDragLayerId(layerId);
    setOverLayerId(layerId);
    setPointerY(event.clientY);
    setDragGhost({
      left: rect.left,
      width: rect.width,
      height: rect.height,
      offsetY: event.clientY - rect.top,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleLayerPointerUp = () => {
    setActiveDragLayerId(null);
    setOverLayerId(null);
    setPointerY(null);
    setDragGhost(null);
  };

  useEffect(() => {
    if (!activeDragLayerId) return;

    const onPointerMove = (event: PointerEvent) => {
      setPointerY(event.clientY);
      const targetId = getLayerIdByPointer(event.clientY);
      if (!targetId || targetId === overLayerId) return;
      setOverLayerId(targetId);
      reorderLayers(activeDragLayerId, targetId);
    };

    const onPointerUp = () => {
      handleLayerPointerUp();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [activeDragLayerId, overLayerId, layers]);

  const openSettings = (id: string) => {
    setActiveLayerId(id);
    setIsSettingsOpen(true);
  };

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return el.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        addLayer('default');
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        addLayer('blur');
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === 'Delete' && activeLayerId) {
        event.preventDefault();
        deleteLayer(activeLayerId);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveLayerId('');
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLayerId, layers]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-screen bg-transparent p-4 overflow-hidden">
      {/* Left Panel - Layers & Export */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden relative">
        <div className="bg-[#f8f8f8] rounded-md border border-black/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Gradient Gen</h1>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={resetLayers}
                  className="gap-2 h-8 px-2 border-black/30 bg-white hover:bg-neutral-100"
                  title="Reset to default layers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm" aria-label="Editor view switcher">
            <Button
              type="button"
              size="sm"
              variant={sidebarView === 'layers' ? 'default' : 'ghost'}
              className="h-8 gap-1.5 text-xs font-black uppercase tracking-tight"
              onClick={() => setSidebarView('layers')}
            >
              <Layers className="h-3.5 w-3.5" /> Layers
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sidebarView === 'gallery' ? 'default' : 'ghost'}
              className="h-8 gap-1.5 text-xs font-black uppercase tracking-tight"
              onClick={() => setSidebarView('gallery')}
            >
              <Sparkles className="h-3.5 w-3.5" /> Gallery
            </Button>
          </div>

          {sidebarView === 'gallery' ? (
            <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm" aria-labelledby="preset-gallery-heading">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                  <Sparkles className="h-3 w-3" /> Preset gallery
                </p>
                <h2 id="preset-gallery-heading" className="text-base font-black text-slate-950">Popular gradients</h2>
                <p className="text-xs font-medium text-slate-500">Browse community favorites, then remix any preset into an editable layer.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-blue-700">
                {PRESET_GALLERY_ITEMS.length} presets
              </span>
            </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
              {PRESET_GALLERY_ITEMS.map((templateKey) => {
                const preset = TEMPLATE_PRESET_CONFIG[templateKey];
                const previewBackground = preset.gradient ? generateGradientCSSString(preset.gradient) : undefined;

                return (
                  <article key={templateKey} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                    <button
                      type="button"
                      className="block h-20 w-full overflow-hidden text-left"
                      onClick={() => remixPreset(templateKey)}
                      aria-label={`Remix ${preset.label}`}
                    >
                      <div className="h-full w-full transition-transform duration-300 group-hover:scale-105" style={{ background: previewBackground }} />
                    </button>
                    <div className="space-y-2 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-xs font-black text-slate-950">{preset.label}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">{preset.category} • {preset.remixes}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">
                          {preset.gradient?.type.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">{preset.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-full gap-1.5 border-blue-200 bg-blue-50 text-[10px] font-black uppercase tracking-tight text-blue-700 hover:bg-blue-100"
                        onClick={() => remixPreset(templateKey)}
                      >
                        <WandSparkles className="h-3 w-3" /> Remix preset
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
            </section>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Layers ({layers.length})
              </h2>
              <div className="flex items-center">
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 px-3 text-[10px] font-bold uppercase tracking-tight gap-1.5 rounded-r-none"
                  onClick={() => addLayer('default')}
                >
                  <Plus className="w-3 h-3" /> New Layer
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2 rounded-l-none border-l border-white/20"
                      aria-label="Choose layer preset"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => addLayer('default')}>
                      Standard Layer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addLayer('blur')}>
                      Blur Layer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addLayer('noise')}>
                      Noise Layer
                    </DropdownMenuItem>
                    {(Object.keys(TEMPLATE_PRESET_CONFIG) as GradientTemplate[]).map((templateKey) => (
                      <DropdownMenuItem key={templateKey} onClick={() => addLayer(templateKey)}>
                        {TEMPLATE_PRESET_CONFIG[templateKey].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1 pb-4 h-full [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  ref={(node) => {
                    layerRowRefs.current[layer.id] = node;
                  }}
                  onClick={() => setActiveLayerId(layer.id)}
                  onDoubleClick={() => openSettings(layer.id)}
                  className={`group relative flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200 ${activeLayerId === layer.id
                    ? 'bg-[#dbeafe] border border-[#93c5fd]'
                    : 'bg-white border border-neutral-300 hover:border-neutral-400'
                    } ${activeDragLayerId === layer.id ? 'opacity-20 scale-[0.99]' : ''
                    } ${overLayerId === layer.id && activeDragLayerId !== layer.id ? 'ring-2 ring-[#93c5fd] border-[#93c5fd] bg-[#dbeafe]' : ''
                    }`}
                >
                  <div
                    className={`text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none ${activeDragLayerId === layer.id ? 'opacity-60' : ''}`}
                    title="Drag to reorder layers"
                    onPointerDown={(event) => handleLayerPointerDown(event, layer.id)}
                    onPointerUp={handleLayerPointerUp}
                    onPointerCancel={handleLayerPointerUp}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  {/* Layer Preview Mini */}
                  <div
                    className="w-8 h-8 rounded-md shadow-inner border border-slate-200 flex-shrink-0 relative overflow-hidden bg-white"
                  >
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: 'conic-gradient(#000 0.25turn, transparent 0 0.5turn, #000 0 0.75turn, transparent 0)',
                        backgroundSize: '4px 4px'
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: layer.preset === 'blur'
                          ? 'rgba(148, 163, 184, 0.2)'
                          : layer.type === 'gradient'
                            ? layer.gradient?.stops[0].color
                            : layer.color,
                        opacity: layer.visible ? 1 : 0.2
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`block text-xs font-bold truncate ${layer.visible ? 'text-slate-900' : 'text-slate-400'}`}>
                      {layer.name}
                    </span>
                    {((layer.preset ?? layer.type) !== 'default' || layer.blendMode !== 'normal') && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">
                        {(layer.preset ?? layer.type)} • {layer.blendMode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-white hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSettings(layer.id);
                      }}
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-3 bg-slate-200 mx-0.5" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {activeDragLayerId && dragGhost && pointerY !== null && (
              <div
                className="fixed z-50 pointer-events-none rounded-md border border-[#93c5fd] bg-white/95 shadow-lg transition-transform duration-75"
                style={{
                  left: dragGhost.left,
                  top: pointerY - dragGhost.offsetY,
                  width: dragGhost.width,
                  height: dragGhost.height,
                }}
              >
                <div className="h-full w-full flex items-center gap-2.5 p-2">
                  <GripVertical className="w-3.5 h-3.5 text-blue-500" />
                  <div className="w-8 h-8 rounded-md border border-slate-200 bg-slate-100" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold truncate text-slate-900">
                      {layers.find((layer) => layer.id === activeDragLayerId)?.name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">
                      Dragging
                    </span>
                  </div>
                </div>
              </div>
            )}
            </div>
          )}
        </div>

        <div className="mt-auto flex justify-end">
          <CSSExport layers={layers} />
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-[#f8f8f8] rounded-md border border-black/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] p-6 overflow-hidden flex flex-col">
        <GradientPreview
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onUpdateLayer={updateLayer}
        />
      </div>

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto border-l border-slate-200 shadow-sm p-0 flex flex-col [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-10 space-y-6">
              <SheetHeader className="mb-2 p-0 space-y-1">
                <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">Layer Settings</SheetTitle>
                <SheetDescription className="text-slate-500 font-medium">
                  Fine-tune the appearance, gradient, and effects for this specific layer.
                </SheetDescription>
              </SheetHeader>

              {selectedLayer && (
                <ControlPanel
                  layer={selectedLayer}
                  onUpdateLayer={updateLayer}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
