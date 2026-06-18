/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Game {
  provider: string;
  name: string;
  cover: string;
  url: string;
  rawUrl?: string;
  isAbsolute: boolean;
  frameType?: string;
  addedOrder: number;
  categories?: string[];
}

export interface ThemeColors {
  '--bg': string;
  '--accent': string;
  '--blue': string;
  '--text': string;
  '--surface': string;
  '--border': string;
}

export type ThemeName = 'default' | 'cyber' | 'sunset' | 'neon' | 'darkred' | 'dnv2' | 'matrix';

export type ProviderName =
  | 'gn-math'
  | 'truffled'
  | 'petezah'
  | 'elite'
  | 'sea-bean'
  | 'ugs'
  | 'blox'
  | 'seraph'
  | 'ckv'
  | 'hydra'
  | 'ccported'
  | 'googleclass'
  | 'nowgg'
  | 'alexrworlds'
  | 'lupine'
  | '3kh0'
  | '3kh0lite';
