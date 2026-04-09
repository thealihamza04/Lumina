'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ColorStop } from '@/lib/gradient-utils';
import { HexColorPicker } from 'react-colorful';
import { Trash2, GripVertical } from 'lucide-react';

// Inline styles for react-colorful
const colorfulStyles = `
.react-colorful {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 200px;
}
.react-colorful__saturation {
  position: relative;
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to right, rgb(255, 255, 255), currentColor);
  cursor: crosshair;
}
.react-colorful__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}
.react-colorful__hue {
  position: relative;
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0));
  cursor: pointer;
}
.react-colorful__alpha {
  position: relative;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}
.react-colorful__pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.react-colorful__input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}
`;

if (typeof document !== 'undefined' && !document.querySelector('[data-colorful-styles]')) {
  const style = document.createElement('style');
  style.setAttribute('data-colorful-styles', 'true');
  style.textContent = colorfulStyles;
  document.head.appendChild(style);
}

interface ColorStopEditorProps {
  stop: ColorStop;
  onUpdate: (stop: ColorStop) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function ColorStopEditor({
  stop,
  onUpdate,
  onDelete,
  isDragging,
}: ColorStopEditorProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={`flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 ${isDragging ? 'opacity-50' : ''}`}>
      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />

      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <button
            className="w-10 h-10 rounded border-2 border-slate-300 cursor-pointer flex-shrink-0"
            style={{ backgroundColor: stop.color }}
            title="Click to change color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-60 p-3">
          <HexColorPicker
            color={stop.color}
            onChange={(color) => onUpdate({ ...stop, color })}
          />
        </PopoverContent>
      </Popover>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-600 mb-1">Position: {stop.position}%</div>
        <input
          type="range"
          min="0"
          max="100"
          value={stop.position}
          onChange={(e) => onUpdate({ ...stop, position: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="text-xs font-medium text-slate-600">Opacity: {Math.round(stop.opacity * 100)}%</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={stop.opacity}
          onChange={(e) => onUpdate({ ...stop, opacity: Number(e.target.value) })}
          className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(stop.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
