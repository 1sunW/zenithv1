/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeColors, ThemeName } from './types';

export const THEMES: Record<ThemeName, ThemeColors> = {
  default: {
    '--bg': '#020617', // bg-slate-950
    '--accent': '#06b6d4', // cyan-500
    '--blue': '#3b82f6', // blue-500
    '--text': '#f1f5f9', // text-slate-100
    '--surface': 'rgba(15, 23, 42, 0.65)', // bg-slate-900 / 65%
    '--border': '#1e293b', // border-slate-800
  },
  cyber: {
    '--bg': '#050c1b',
    '--accent': '#39ff14',
    '--blue': '#00ffff',
    '--text': '#e0ffe0',
    '--surface': 'rgba(0,255,0,0.05)',
    '--border': 'rgba(0,255,0,0.1)',
  },
  sunset: {
    '--bg': '#1a0b0b',
    '--accent': '#ff6f61',
    '--blue': '#ffa500',
    '--text': '#fff0e6',
    '--surface': 'rgba(255,110,100,0.05)',
    '--border': 'rgba(255,110,100,0.1)',
  },
  neon: {
    '--bg': '#0f0020',
    '--accent': '#ff00ff',
    '--blue': '#00ffff',
    '--text': '#ffffff',
    '--surface': 'rgba(255,0,255,0.05)',
    '--border': 'rgba(255,0,255,0.1)',
  },
  darkred: {
    '--bg': '#1b0000',
    '--accent': '#ff0000',
    '--blue': '#cc0000',
    '--text': '#ffe6e6',
    '--surface': 'rgba(255,0,0,0.05)',
    '--border': 'rgba(255,0,0,0.1)',
  },
  dnv2: {
    '--bg': '#050007',
    '--accent': '#ff00de',
    '--blue': '#00fff7',
    '--text': '#ffffff',
    '--surface': 'rgba(255,0,255,0.05)',
    '--border': 'rgba(255,0,255,0.15)',
  },
  matrix: {
    '--bg': '#001100',
    '--accent': '#00ff00',
    '--blue': '#33ff33',
    '--text': '#99ff99',
    '--surface': 'rgba(0,255,0,0.05)',
    '--border': 'rgba(0,255,0,0.15)',
  },
};

export const TRUFFLED_PROXIES = [
  { value: 'https://truffled.lol', label: 'truffled.lol (Default)' },
  { value: 'https://classlink.com.de', label: 'classlink.com.de' },
  { value: 'https://pamson.pl.sophiemaslowski.com', label: 'pamson.pl.sophiemaslowski.com' },
  { value: 'https://lightspeed-sucks.9ibee.com', label: 'lightspeed-sucks.9ibee.com' },
];

export const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'action', label: 'Action' },
  { value: 'racing', label: 'Racing' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'sports', label: 'Sports' },
  { value: 'skill', label: 'Skill' },
  { value: 'shooting', label: 'Shooting' },
  { value: '2 player', label: '2 Player' },
  { value: 'io', label: 'Io' },
];

export const PROVIDERS = [
  { value: 'gn-math', label: 'GN-Math' },
  { value: 'truffled', label: 'Truffled.lol' },
  { value: 'petezah', label: 'PeteZah' },
  { value: 'elite', label: 'Elite Gamez' },
  { value: 'sea-bean', label: 'Sea Bean' },
  { value: 'ugs', label: 'UGS' },
  { value: 'blox', label: 'Bloxcraft UBG' },
  { value: 'seraph', label: 'Seraph' },
  { value: 'ckv', label: "Chicken King's Vault" },
  { value: 'hydra', label: 'Hydra Network' },
  { value: 'ccported', label: 'CCPorted stupid games' },
  { value: 'googleclass', label: 'Google Class Files' },
  { value: 'nowgg', label: 'NowGG' },
  { value: 'alexrworlds', label: "Alexr's Worlds" },
  { value: 'lupine', label: 'Lupine Vault' },
  { value: '3kh0', label: '3kh0' },
  { value: '3kh0lite', label: '3kh0 Lite' },
];
