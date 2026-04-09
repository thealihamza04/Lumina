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
  Layers,
  Trash2,
  Eye,
  EyeOff,
  Settings2
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export function GradientEditor() {
  const [layers, setLayers] = useState<Layer[]>([
    getDefaultLayer('1'),
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('1');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];

  const resetLayers = () => {
    const defaultLayer = getDefaultLayer('1');
    setLayers([defaultLayer]);
    setActiveLayerId('1');
  };

  const addLayer = () => {
    const newLayer = getDefaultLayer();
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

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (direction === 'up' && index > 0) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      setLayers(newLayers);
    } else if (direction === 'down' && index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      setLayers(newLayers);
    }
  };

  const openSettings = (id: string) => {
    setActiveLayerId(id);
    setIsSettingsOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 overflow-hidden">
      {/* Left Panel - Layers & Export */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Gradient Gen</h1>
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

          {/* Layer List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Layers ({layers.length})
              </h2>
              <Button
                size="sm"
                variant="default"
                className="h-7 px-3 text-[10px] font-bold uppercase tracking-tight gap-1.5"
                onClick={addLayer}
              >
                <Plus className="w-3 h-3" /> New Layer
              </Button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2 pb-4 h-full">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeLayerId === layer.id
                    ? 'bg-blue-50 border border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md'
                    }`}
                >
                  {/* Layer Preview Mini */}
                  <div
                    className="w-10 h-10 rounded-lg shadow-inner border border-slate-200 flex-shrink-0 relative overflow-hidden bg-white"
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
                        background: layer.type === 'gradient' ? layer.gradient?.stops[0].color : layer.color,
                        opacity: layer.visible ? 1 : 0.2
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`block text-sm font-semibold truncate ${layer.visible ? 'text-slate-900' : 'text-slate-400'}`}>
                      {layer.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      {layer.type} • {layer.blendMode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-white hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSettings(layer.id);
                      }}
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-slate-200 mx-0.5" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                    >
                      {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
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
        <GradientPreview layers={layers} />
      </div>

      {/* Layer Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto border-l border-slate-200 shadow-2xl">
          <SheetHeader className="mb-8 space-y-2">
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
