/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onQuickFilter?: (filterType: string) => void;
}

export default function Header({ onOpenSettings, onQuickFilter }: HeaderProps) {
  return (
    <header
      id="main-app-header"
      className="border-b transition-colors duration-300 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-4 flex flex-col md:flex-row gap-4 items-center justify-between"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'rgba(9, 13, 26, 0.85)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Brand Zenith games icon with gradient & neon shadow glow */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--blue))',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.45)',
            }}
            onClick={() => onQuickFilter?.('all')}
          >
            <span className="text-xl font-black italic select-none text-black">Z</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tighter text-white uppercase select-none">
                ZENITH<span className="font-semibold" style={{ color: 'var(--accent)' }}>PORTAL</span>
              </span>
              <span
                className="hidden sm:flex items-center gap-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider scale-90"
                style={{
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <ShieldCheck className="w-2 h-2" /> SECURE
              </span>
            </div>
            <p
              className="text-[10px] font-mono tracking-tight opacity-50 hidden sm:block"
              style={{ color: 'var(--text)' }}
            >
              All your favorite games in one place.
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Menu Items */}
        <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <button
            onClick={() => onQuickFilter?.('all')}
            className="hover:text-white transition-colors cursor-pointer border-b-2 border-transparent hover:border-[var(--accent)] pb-0.5 text-[11px]"
          >
            Home
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-end shrink-0">
        <button
          id="settings-toggle-btn"
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-sans text-sm font-semibold select-none cursor-pointer border border-solid hover:opacity-90"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          title="Open Portal Settings"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
