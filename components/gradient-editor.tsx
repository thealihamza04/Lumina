'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
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
    setLayers((prevLayers) => [newLayer, ...prevLayers]);
    setActiveLayerId(newLayer.id);
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
        </div>

        <div className="absolute bottom-0 right-0 flex justify-end">
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
