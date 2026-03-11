'use client';

import { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
}

const PRESET_COLORS = [
  '#818cf8', // индиго (мягкий)
  '#5ee4b8', // мятный
  '#f9a8d4', // розовый
  '#fdba74', // персиковый
  '#86efac', // светло-зеленый
  '#93c5fd', // голубой
  '#d8b4fe', // лавандовый
  '#fde047', // нежно-желтый
  '#fca5a5', // коралловый
  '#c4b5fd', // сиреневый
  '#6ee7b7', // бирюзовый
  '#fed7aa', // абрикосовый
];

export default function ColorPicker({ value, onChange, label, error }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative pt-2" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Предпросмотр цвета */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          style={{ backgroundColor: value }}
        />

        {/* HEX ввод */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono"
          placeholder="#000000"
        />
      </div>

      {/* Палитра цветов */}
      {isOpen && (
        <div className="absolute left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border z-10">
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: color,
                  borderColor: color === value ? '#000' : 'transparent'
                }}
              />
            ))}
          </div>
          
          <div className="mt-2 pt-2 border-t">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 cursor-pointer"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-200">{error}</p>
      )}
    </div>
  );
}