'use client';

import { useState } from 'react';
import { Layer, generateGradientCSSString } from '@/lib/gradient-utils';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check, Code2, ExternalLink } from 'lucide-react';
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

export function CSSExport({ layers }: CSSExportProps) {
  const [copied, setCopied] = useState(false);

  const generateFullCSS = () => {
    let css = '/* --- Container Styles --- */\n.gradient-container {\n  position: relative;\n  width: 100%;\n  height: 100vh;\n  overflow: hidden;\n  background: #fff;\n}\n\n';

    layers.filter(l => l.visible).forEach((layer, index) => {
      css += `/* Layer: ${layer.name} */\n`;
      css += `.layer-${index} {\n`;
      css += '  position: absolute;\n';
      css += `  left: ${layer.x ?? 0}%;\n`;
      css += `  top: ${layer.y ?? 0}%;\n`;
      css += `  width: ${layer.width ?? 100}%;\n`;
      css += `  height: ${layer.height ?? 100}%;\n`;
      if (layer.type === 'gradient') {
        css += `  background: ${generateGradientCSSString(layer.gradient!)};\n`;
      } else {
        css += `  background-color: ${layer.color};\n`;
      }
      if (layer.opacity < 1) css += `  opacity: ${layer.opacity};\n`;
      if (layer.blendMode !== 'normal') css += `  mix-blend-mode: ${layer.blendMode};\n`;

      const filters = [];
      if (layer.blurEnabled) filters.push(`blur(${layer.blurAmount}px)`);
      if (layer.noiseEnabled) filters.push(`url(#noise-${layer.id})`);

      if (filters.length > 0) {
        css += `  filter: ${filters.join(' ')};\n`;
      }
      if ((layer.rotation ?? 0) !== 0) {
        css += `  transform: rotate(${layer.rotation}deg);\n`;
      }

      css += `  z-index: ${layers.indexOf(layer)};\n`;
      css += '}\n\n';
    });

    return css;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateFullCSS());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCSS = () => {
    const content = generateFullCSS();
    const blob = new Blob([content], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient-composition.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-xl shadow-sm transition-all active:scale-[0.98]">
          <Code2 className="w-5 h-5 text-blue-400" />
          Export Composition
          <ExternalLink className="w-4 h-4 opacity-30" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-600" />
            </div>
            CSS Composition Code
          </DialogTitle>
          <DialogDescription>
            Copy the styles below to use this multi-layered gradient effect in your project.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden flex flex-col shadow-inner mb-6">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CSS Output</span>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/30" />
              <div className="w-2 h-2 rounded-full bg-orange-500/30" />
              <div className="w-2 h-2 rounded-full bg-green-500/30" />
            </div>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-sm leading-relaxed text-blue-100/90 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800">
            {generateFullCSS()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="default"
            onClick={copyToClipboard}
            className={`gap-2 h-12 font-bold transition-all ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied Successfully!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={downloadCSS}
            className="gap-2 h-12 font-bold border-2 hover:bg-slate-50"
          >
            <Download className="w-5 h-5" />
            Download .css File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

