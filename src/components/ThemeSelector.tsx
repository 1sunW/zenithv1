/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { THEMES } from '../constants';
import { ThemeName } from '../types';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply initial theme variables
    const themeColors = THEMES[currentTheme];
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [currentTheme]);

  const selectTheme = (name: ThemeName) => {
    onThemeChange(name);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        id="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-sans text-sm font-semibold select-none cursor-pointer"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
        title="Change Visual Theme"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden md:inline capitalize">{currentTheme} Theme</span>
      </button>

      {isOpen && (
        <>
          <div
            id="theme-backdrop"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="theme-menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-3 duration-200"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
              Select Theme
            </div>
            <div className="flex flex-col gap-1">
              {(Object.keys(THEMES) as ThemeName[]).map((name) => {
                const colors = THEMES[name];
                return (
                  <button
                    key={name}
                    onClick={() => selectTheme(name)}
                    className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-100 transition-all cursor-pointer"
                    style={{
                      color: 'var(--text)',
                      backgroundColor: currentTheme === name ? 'var(--surface)' : 'transparent',
                    }}
                  >
                    <span className="capitalize">{name}</span>
                    <div className="flex gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: colors['--accent'] }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: colors['--blue'] }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: colors['--bg'] }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
