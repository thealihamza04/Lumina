'use client';

import { useMemo, useState } from 'react';
import { Layer, generateGradientCSSString } from '@/lib/gradient-utils';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check, Code2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

interface CSSExportProps {
  layers: Layer[];
}

type ExportTab = 'css' | 'tailwind' | 'react';
type OutputPreset = 'hero' | 'card';

const mapBlendToCanvas: Partial<Record<Layer['blendMode'], GlobalCompositeOperation>> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
};

export function CSSExport({ layers }: CSSExportProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<ExportTab>('css');
  const [preset, setPreset] = useState<OutputPreset>('hero');
  const [pngWarning, setPngWarning] = useState<string | null>(null);

  const containerStyles = useMemo(() => {
    if (preset === 'card') {
      return {
        width: '420px',
        height: '260px',
        borderRadius: '24px',
      };
    }
    return {
      width: '100%',
      height: '100vh',
      borderRadius: '0px',
    };
  }, [preset]);

  const generateLayerBackground = (layer: Layer) => {
    if (layer.preset === 'blur') return 'transparent';
    if (layer.type === 'gradient' && layer.gradient) return generateGradientCSSString(layer.gradient);
    return layer.color || 'transparent';
  };

  const generateCSS = () => {
    let css = `/* --- ${preset === 'hero' ? 'Hero' : 'Card'} Container Styles --- */\n.gradient-container {\n  position: relative;\n  width: ${containerStyles.width};\n  height: ${containerStyles.height};\n  overflow: hidden;\n  background: #fff;\n  border-radius: ${containerStyles.borderRadius};\n}\n\n`;

    layers.forEach((layer, index) => {
      if (!layer.visible) return;
      css += `/* Layer: ${layer.name} */\n`;
      css += `.layer-${index} {\n`;
      css += '  position: absolute;\n';
      css += `  left: ${layer.x ?? 0}%;\n`;
      css += `  top: ${layer.y ?? 0}%;\n`;
      css += `  width: ${layer.width ?? 100}%;\n`;
      css += `  height: ${layer.height ?? 100}%;\n`;
      if (layer.preset === 'blur') {
        css += '  background: transparent;\n';
        css += `  backdrop-filter: blur(${layer.blurAmount}px);\n`;
      } else {
        css += `  background: ${generateLayerBackground(layer)};\n`;
      }
      if (layer.opacity < 1) css += `  opacity: ${layer.opacity};\n`;
      if (layer.blendMode !== 'normal') css += `  mix-blend-mode: ${layer.blendMode};\n`;

      const filters = [];
      if (layer.blurEnabled && layer.preset !== 'blur') filters.push(`blur(${layer.blurAmount}px)`);
      if (layer.noiseEnabled) filters.push(`url(#noise-${layer.id})`);
      if (filters.length > 0) css += `  filter: ${filters.join(' ')};\n`;
      if ((layer.rotation ?? 0) !== 0) css += `  transform: rotate(${layer.rotation}deg);\n`;

      css += `  z-index: ${layers.length - index};\n`;
      css += '}\n\n';
    });

    return css;
  };

  const generateTailwind = () => {
    const baseClass = preset === 'hero'
      ? 'relative w-full h-screen overflow-hidden bg-white'
      : 'relative w-[420px] h-[260px] rounded-3xl overflow-hidden bg-white';
    return [
      '// Tailwind wrapper',
      `<div className="${baseClass}">`,
      '  {/* Add child divs with inline style objects below */}',
      '</div>',
      '',
      '// Suggested style object array (preserves advanced filters/blend modes):',
      generateReactStyles(),
    ].join('\n');
  };

  const generateReactStyles = () => {
    const styleArray = layers
      .filter((layer) => layer.visible)
      .map((layer, index) => ({
        layer: layer.name,
        style: {
          position: 'absolute',
          left: `${layer.x ?? 0}%`,
          top: `${layer.y ?? 0}%`,
          width: `${layer.width ?? 100}%`,
          height: `${layer.height ?? 100}%`,
          background: generateLayerBackground(layer),
          opacity: layer.opacity,
          mixBlendMode: layer.blendMode,
          filter: `${layer.blurEnabled && layer.preset !== 'blur' ? `blur(${layer.blurAmount}px)` : ''}${layer.noiseEnabled ? ` url(#noise-${layer.id})` : ''}`.trim() || 'none',
          transform: `rotate(${layer.rotation ?? 0}deg)`,
          zIndex: layers.length - index,
        },
      }));

    return `const layerStyles = ${JSON.stringify(styleArray, null, 2)};`;
  };

  const activeOutput = tab === 'css'
    ? generateCSS()
    : tab === 'tailwind'
      ? generateTailwind()
      : generateReactStyles();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(activeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadText = () => {
    const ext = tab === 'css' ? 'css' : 'txt';
    const blob = new Blob([activeOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tab === 'css' ? `gradient-${preset}.css` : `gradient-${tab}-${preset}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    const width = preset === 'hero' ? 1920 : 1200;
    const height = preset === 'hero' ? 1080 : 740;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const warnings: string[] = [];
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    layers.filter((layer) => layer.visible).forEach((layer) => {
      const x = ((layer.x ?? 0) / 100) * width;
      const y = ((layer.y ?? 0) / 100) * height;
      const w = ((layer.width ?? 100) / 100) * width;
      const h = ((layer.height ?? 100) / 100) * height;

      if (layer.preset === 'blur' || layer.noiseEnabled) warnings.push(`${layer.name}: blur/noise filter approximated or omitted in PNG export.`);

      const blend = mapBlendToCanvas[layer.blendMode];
      if (!blend) warnings.push(`${layer.name}: blend mode "${layer.blendMode}" not fully supported in canvas export.`);
      ctx.globalCompositeOperation = blend || 'source-over';
      ctx.globalAlpha = layer.opacity;

      const rotation = ((layer.rotation ?? 0) * Math.PI) / 180;
      ctx.save();
      ctx.translate(x + (w / 2), y + (h / 2));
      ctx.rotate(rotation);
      ctx.translate(-(x + (w / 2)), -(y + (h / 2)));

      if (layer.type === 'gradient' && layer.gradient) {
        if (layer.gradient.type.startsWith('conic')) {
          warnings.push(`${layer.name}: conic gradient approximated as radial in PNG export.`);
        }

        if (layer.gradient.type.startsWith('radial') || layer.gradient.type.startsWith('conic')) {
          const centerX = x + (((layer.gradient.radialX ?? 50) / 100) * w);
          const centerY = y + (((layer.gradient.radialY ?? 50) / 100) * h);
          const radius = Math.max(w, h) / 2;
          const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          layer.gradient.stops
            .sort((a, b) => a.position - b.position)
            .forEach((stop) => {
              const alphaColor = stop.color.startsWith('#') ? `${stop.color}${Math.round(stop.opacity * 255).toString(16).padStart(2, '0')}` : stop.color;
              grad.addColorStop(Math.min(1, Math.max(0, stop.position / 100)), alphaColor);
            });
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, w, h);
        } else {
          const angleRad = (layer.gradient.angle * Math.PI) / 180;
          const centerX = x + w / 2;
          const centerY = y + h / 2;
          const dx = Math.cos(angleRad) * (w / 2);
          const dy = Math.sin(angleRad) * (h / 2);
          const grad = ctx.createLinearGradient(centerX - dx, centerY - dy, centerX + dx, centerY + dy);
          layer.gradient.stops
            .sort((a, b) => a.position - b.position)
            .forEach((stop) => {
              const alphaColor = stop.color.startsWith('#') ? `${stop.color}${Math.round(stop.opacity * 255).toString(16).padStart(2, '0')}` : stop.color;
              grad.addColorStop(Math.min(1, Math.max(0, stop.position / 100)), alphaColor);
            });
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, w, h);
        }
      } else {
        ctx.fillStyle = layer.color || 'transparent';
        ctx.fillRect(x, y, w, h);
      }

      ctx.restore();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `gradient-${preset}-1920x1080.png`;
    a.click();
    setPngWarning(warnings.length ? warnings.join(' ') : 'PNG exported with full compatibility.');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="h-9 w-9 bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-sm transition-all active:scale-[0.98]"
          aria-label="Export composition"
          title="Export composition"
        >
          <Code2 className="w-4 h-4 text-blue-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[84vh] flex flex-col p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-600" />
            </div>
            Production Export
          </DialogTitle>
          <DialogDescription>
            Export this composition as CSS, Tailwind-ready snippet, React style objects, or high-res PNG.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-3">
          {(['css', 'tailwind', 'react'] as ExportTab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide ${tab === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {item}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Preset</span>
            <select
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
              value={preset}
              onChange={(e) => setPreset(e.target.value as OutputPreset)}
            >
              <option value="hero">Hero section</option>
              <option value="card">Card background</option>
            </select>
          </div>
        </div>

        <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden flex flex-col shadow-inner mb-4">
          <div className="p-4 overflow-y-auto font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre">
            {activeOutput}
          </div>
        </div>

        {pngWarning && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
            {pngWarning}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Button size="lg" onClick={copyToClipboard} className={`gap-2 h-11 font-bold ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {copied ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
          </Button>
          <Button size="lg" variant="outline" onClick={downloadText} className="gap-2 h-11 font-bold border-2 hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Download {tab === 'css' ? '.css' : '.txt'}
          </Button>
          <Button size="lg" variant="outline" onClick={downloadPNG} className="gap-2 h-11 font-bold border-2 hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
