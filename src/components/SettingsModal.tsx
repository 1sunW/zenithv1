/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { THEMES } from '../constants';
import { ThemeName } from '../types';
import { X, Palette, EyeOff, ExternalLink, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export interface CloakPreset {
  name: string;
  title: string;
  icon: string;
}

export const CLOAK_PRESETS: Record<string, CloakPreset> = {
  reset: {
    name: 'None (Zenith Default)',
    title: 'Zenith Portal',
    icon: 'favicon.ico',
  },
  drive: {
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
  },
  classroom: {
    name: 'Google Classroom',
    title: 'Classes',
    icon: 'https://ssl.gstatic.com/images/branding/product/1x/classroom_32dp.png',
  },
  canvas: {
    name: 'Canvas LMS',
    title: 'Dashboard',
    icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e05d51a14c.ico',
  },
  powerschool: {
    name: 'PowerSchool Classroom',
    title: 'PowerSchool Parent Portal',
    icon: 'https://www.powerschool.com/favicon.ico',
  }
};

export const applyCloak = (presetKey: string) => {
  const preset = CLOAK_PRESETS[presetKey];
  if (!preset) return;

  // Set Title
  document.title = preset.title;

  // Find or create favicon link element
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  if (presetKey === 'reset') {
    link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>🌀</text></svg>';
  } else {
    link.href = preset.icon;
  }
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'cloak'>('themes');
  const [currentCloak, setCurrentCloak] = useState<string>(() => {
    return localStorage.getItem('zenith-disguise-cloak') || 'reset';
  });

  const handleCloakChange = (presetKey: string) => {
    setCurrentCloak(presetKey);
    localStorage.setItem('zenith-disguise-cloak', presetKey);
    applyCloak(presetKey);
  };

  const handleLaunchAboutBlank = () => {
    const url = window.location.href;
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert('Pop-up blocked! Please allow pop-ups for Zenith Portal to use this feature.');
      return;
    }
    const doc = win.document;
    
    // Set title and favicon on the new empty tab
    doc.title = CLOAK_PRESETS[currentCloak]?.title || 'Classes';
    
    const favLink = doc.createElement('link');
    favLink.rel = 'shortcut icon';
    favLink.href = CLOAK_PRESETS[currentCloak]?.icon || 'https://ssl.gstatic.com/images/branding/product/1x/classroom_32dp.png';
    doc.head.appendChild(favLink);

    // Create container and iframe inside
    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.overflow = 'hidden';
    doc.body.style.backgroundColor = '#000';
    
    const iframe = doc.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    
    doc.body.appendChild(iframe);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Core Modal Frame */}
      <div
        className="relative w-full max-w-2xl rounded-2xl border flex flex-col overflow-hidden max-h-[85vh] shadow-[0_15px_40px_-5px_rgba(0,0,0,0.85)]"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--blue))',
              }}
            >
              <span className="text-sm font-black italic select-none text-black">Z</span>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase uppercase">
                Portal Settings
              </h2>
              <p className="text-[10px] font-mono tracking-wider opacity-60 text-slate-400">
                Configure your gaming playground
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          className="flex border-b text-xs font-extrabold uppercase tracking-widest text-slate-400"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-3 text-center border-b-2 font-display select-none transition-all cursor-pointer flex justify-center items-center gap-2 ${
              activeTab === 'themes'
                ? 'text-white border-[var(--accent)] bg-white/5'
                : 'border-transparent hover:text-white hover:bg-white/2'
            }`}
          >
            <Palette className="w-4 h-4" />
            Themes
          </button>
          <button
            onClick={() => setActiveTab('cloak')}
            className={`flex-1 py-3 text-center border-b-2 font-display select-none transition-all cursor-pointer flex justify-center items-center gap-2 ${
              activeTab === 'cloak'
                ? 'text-white border-[var(--accent)] bg-white/5'
                : 'border-transparent hover:text-white hover:bg-white/2'
            }`}
          >
            <EyeOff className="w-4 h-4" />
            Tab Cloaker
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'themes' ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400">
                Select a customized color palette to theme your dashboard experience instantly:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(THEMES) as ThemeName[]).map((name) => {
                  const colors = THEMES[name];
                  const isSelected = currentTheme === name;
                  return (
                    <button
                      key={name}
                      onClick={() => onThemeChange(name)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer group text-slate-400 hover:text-white ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--surface)] text-white'
                          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className="capitalize text-sm font-extrabold text-white tracking-tight">
                          {name} Theme
                        </span>
                        {isSelected && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'black',
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <div className="flex -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/30"
                            style={{ backgroundColor: colors['--accent'] }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/30"
                            style={{ backgroundColor: colors['--blue'] }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/30"
                            style={{ backgroundColor: colors['--bg'] }}
                          />
                        </div>
                        <span className="text-[10px] font-mono tracking-wider uppercase opacity-60">
                          {colors['--bg']}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Introduction to Cloaking */}
              <div className="rounded-xl border border-dashed border-cyan-500/20 p-4 bg-cyan-500/5 flex gap-3.5 items-start">
                <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-white uppercase tracking-wider">
                    Tab Cloaking Engine Active
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Disguise Zenith Portal in your browser history and tabs instantly. Selecting a preset changes the webpage tab title and icon to matching educational tools like Google Drive or Classroom.
                  </p>
                </div>
              </div>

              {/* Presets Selection Grid */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Select Tab Disguise Preset
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CLOAK_PRESETS).map(([key, preset]) => {
                    const isSelected = currentCloak === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleCloakChange(key)}
                        className={`flex items-center gap-3.5 text-left p-3.5 rounded-xl border transition-all cursor-pointer group text-slate-400 hover:text-white ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--surface)] text-white'
                            : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center p-2 border border-slate-800 shrink-0">
                          {key === 'reset' ? (
                            <span className="text-base">🌀</span>
                          ) : (
                            <img
                              src={preset.icon}
                              alt={preset.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-extrabold text-xs text-white truncate">
                            {preset.name}
                          </div>
                          <div className="text-[10px] font-mono opacity-50 truncate mt-0.5">
                            Title: {preset.title}
                          </div>
                        </div>

                        {isSelected && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: 'black',
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* separator */}
              <div className="border-t border-slate-800/60" />

              {/* about:blank Cloak Launcher Section */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  about:blank Inception Cloaker
                </div>
                <div className="p-4 rounded-xl border border-solid border-slate-800 bg-slate-950/50 space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    For maximum security, launch Zenith Portal inside a completely blank tab (<code className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-cyan-400 text-[10px]">about:blank</code>). 
                    The page will load full screen in an invisible frame. It leaves no trace of its domain in your tab history or schools extension monitoring systems.
                  </p>
                  <button
                    onClick={handleLaunchAboutBlank}
                    className="flex items-center justify-center gap-2.5 px-6 py-3 w-full sm:w-auto rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all text-black cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--blue))',
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Launch in about:blank Page
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
