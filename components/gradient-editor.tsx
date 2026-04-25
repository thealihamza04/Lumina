'use client';

import { useState } from 'react';
import { Layer, getDefaultLayer } from '@/lib/gradient-utils';
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
  LayoutGrid
} from 'lucide-react';
import { GRADIENT_TEMPLATES, GradientTemplate } from '@/lib/templates';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateGradientCSSString } from '@/lib/gradient-utils';

export function GradientEditor() {
  const [layers, setLayers] = useState<Layer[]>([
    getDefaultLayer('1'),
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];

  const resetLayers = () => {
    const defaultLayer = getDefaultLayer('1');
    setLayers([defaultLayer]);
    setActiveLayerId('1');
  };

  const addLayer = (preset: 'default' | 'blur' | 'noise' = 'default') => {
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
      newLayer.noiseEnabled = true;
      newLayer.noiseAmount = 55;
      newLayer.opacity = 0.5;
      newLayer.blendMode = 'overlay';
      newLayer.preset = 'noise';
    }
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
    setIsSettingsOpen(true);
  };

  const deleteLayer = (id: string) => {
    if (layers.length > 1) {
      const newLayers = layers.filter(l => l.id !== id);
      setLayers(newLayers);
      if (activeLayerId === id) {
        setActiveLayerId(newLayers[0].id);
      }
    }
  };

  const updateLayer = (updatedLayer: Layer) => {
    setLayers(layers.map(l => l.id === updatedLayer.id ? updatedLayer : l));
  };

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const moveLayerByDrag = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const draggedIndex = layers.findIndex((l) => l.id === draggedId);
    const targetIndex = layers.findIndex((l) => l.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const reordered = [...layers];
    const [draggedLayer] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedLayer);
    setLayers(reordered);
  };

  const openSettings = (id: string) => {
    setActiveLayerId(id);
    setIsSettingsOpen(true);
  };

  const applyTemplate = (template: GradientTemplate) => {
    const newLayers: Layer[] = template.layers.map((l, i) => {
      const layerId = `layer-${Date.now()}-${i}`;
      return {
        ...l,
        id: layerId,
        gradient: l.gradient ? {
          ...l.gradient,
          stops: l.gradient.stops.map((s, si) => ({
            ...s,
            id: `stop-${layerId}-${si}`
          }))
        } : undefined,
        x: l.x ?? 0,
        y: l.y ?? 0,
        width: l.width ?? 100,
        height: l.height ?? 100,
        rotation: l.rotation ?? 0,
        preset: l.preset ?? 'default',
      } as Layer;
    });
    setLayers(newLayers);
    setActiveLayerId(newLayers[0].id);
    setIsTemplatesOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 overflow-hidden">
      {/* Left Panel - Layers & Export */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Gradient Gen</h1>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={resetLayers}
                className="gap-2 h-8 px-2"
                title="Reset to default layers"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            </div>
          </div>

          {/* Templates Section */}
          <div className="mb-6">
            <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between gap-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 group h-11 px-4 text-sm font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-700">Explore Templates</span>
                  </div>
                  <LayoutGrid className="w-4 h-4 text-slate-400" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Gradient Presets
                  </DialogTitle>
                  <DialogDescription>
                    Choose a professionally crafted gradient to start your composition. 
                    You can customize all layers after applying.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                  {GRADIENT_TEMPLATES.map((template) => (
                    <div key={template.id} className="group relative">
                      <button
                        onClick={() => applyTemplate(template)}
                        className="w-full aspect-square rounded-xl border-2 border-slate-100 overflow-hidden hover:border-blue-500 transition-all hover:shadow-xl relative bg-slate-50"
                      >
                        <div className="absolute inset-0 pointer-events-none">
                          {template.layers.slice().reverse().map((layer, idx) => (
                            <div
                              key={idx}
                              className="absolute inset-0"
                              style={{
                                background: layer.type === 'gradient' && layer.gradient
                                  ? generateGradientCSSString(layer.gradient)
                                  : layer.color,
                                opacity: layer.opacity,
                                mixBlendMode: layer.blendMode as any,
                                filter: layer.blurEnabled ? `blur(${layer.blurAmount / 4}px)` : 'none'
                              }}
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                      <p className="mt-2 text-[11px] font-bold text-slate-600 uppercase tracking-tighter text-center">
                        {template.name}
                      </p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Layer List */}
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2 pb-4 h-full">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  draggable
                  onDragStart={() => setDraggingLayerId(layer.id)}
                  onDragEnd={() => setDraggingLayerId(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!draggingLayerId) return;
                    moveLayerByDrag(draggingLayerId, layer.id);
                    setDraggingLayerId(null);
                  }}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`group relative flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200 ${activeLayerId === layer.id
                    ? 'bg-blue-50 border border-blue-200 ring-1 ring-blue-500/10'
                    : 'bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm'
                    }`}
                >
                  <div
                    className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
                    title="Drag to reorder layers"
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">
                      {(layer.preset ?? layer.type)} • {layer.blendMode}
                    </span>
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
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mt-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Export Options</h2>
          <CSSExport layers={layers} />
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col">
        <h2 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Global Composition Preview</h2>
        <GradientPreview
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={setActiveLayerId}
          onUpdateLayer={updateLayer}
        />
      </div>

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto border-l border-slate-200 shadow-sm p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-10 space-y-6">
              <SheetHeader className="mb-2 p-0 space-y-1">
                <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">Layer Settings</SheetTitle>
                <SheetDescription className="text-slate-500 font-medium">
                  Fine-tune the appearance, gradient, and effects for this specific layer.
                </SheetDescription>
              </SheetHeader>

              {activeLayer && (
                <ControlPanel
                  layer={activeLayer}
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
