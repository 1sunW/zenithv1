/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GameCard from './components/GameCard';
import { TruffledNoticeModal, BlockedModal } from './components/SystemModals';
import GameModal from './components/GameModal';
import SettingsModal, { applyCloak } from './components/SettingsModal';
import { Game, ThemeName, ProviderName } from './types';
import { PROVIDERS, TRUFFLED_PROXIES, CATEGORIES, THEMES } from './constants';
import { Gamepad, Search, RefreshCw, AlertTriangle, Clock, Trash2 } from 'lucide-react';

function getFallbackImage(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0b0a16&color=7a5cff&size=256&font-size=0.33&bold=true`;
}

export default function App() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem('unblocked-games-theme') as ThemeName) || 'default';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Apply theme variables dynamically since selector moved to full settings page
  useEffect(() => {
    const themeColors = THEMES[currentTheme];
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value as string);
      });
    }
  }, [currentTheme]);

  // Load and apply initial tab cloak
  useEffect(() => {
    const savedCloak = localStorage.getItem('zenith-disguise-cloak') || 'reset';
    applyCloak(savedCloak);
  }, []);

  // Providers & proxy variables
  const [selectedProvider, setSelectedProvider] = useState<ProviderName>(() => {
    try {
      const saved = localStorage.getItem('unblocked-games-provider');
      const isValid = PROVIDERS.some(prov => prov.value === saved);
      return isValid ? (saved as ProviderName) : 'gn-math';
    } catch (e) {
      return 'gn-math';
    }
  });

  const [selectedProxy, setSelectedProxy] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('unblocked-games-proxy');
      const isValid = TRUFFLED_PROXIES.some(proxy => proxy.value === saved);
      return isValid ? saved! : TRUFFLED_PROXIES[0].value;
    } catch (e) {
      return TRUFFLED_PROXIES[0].value;
    }
  });

  // Automatically save selections whenever they change to prevent resetting on mobile page reloads/network switching
  useEffect(() => {
    try {
      localStorage.setItem('unblocked-games-provider', selectedProvider);
    } catch (e) {
      console.warn('Failed to save provider to localStorage:', e);
    }
  }, [selectedProvider]);

  useEffect(() => {
    try {
      localStorage.setItem('unblocked-games-proxy', selectedProxy);
    } catch (e) {
      console.warn('Failed to save proxy to localStorage:', e);
    }
  }, [selectedProxy]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMethod, setSortMethod] = useState<string>('a-z');

  // Search history state
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('unblocked-games-search-history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Helper to save unique queries in history
  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('unblocked-games-search-history', JSON.stringify(updated));
      return updated;
    });
  };

  // Application State
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  // Modal Triggers
  const [showTruffledNotice, setShowTruffledNotice] = useState<boolean>(false);
  const [showBlockedModal, setShowBlockedModal] = useState<boolean>(false);

  // Watch theme alterations
  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    localStorage.setItem('unblocked-games-theme', theme);
  };

  // Keep track of provider alterations to swap corresponding sorts or notice requirements
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProv = e.target.value as ProviderName;
    setSelectedProvider(nextProv);
    setSelectedCategory('');

    // Pre-setting sort logic matching the original JS conditions
    if (nextProv === 'gn-math') {
      setSortMethod('latest');
    } else {
      setSortMethod('a-z');
    }

    // Checking notice guidelines for truffled community
    if (nextProv === 'truffled') {
      const seen = localStorage.getItem('truffledNoticeSeen') === 'true';
      if (!seen) {
        setShowTruffledNotice(true);
      }
    }
  };

  // Check if proxy responds
  const verifyTruffledProxy = async (proxy: string) => {
    try {
      const res = await fetch(`${proxy.replace(/\/$/, '')}/png/logo.png`, {
        mode: 'no-cors',
        cache: 'no-store',
      });
      return true;
    } catch (e) {
      console.warn('Proxy validation failed:', e);
      return false;
    }
  };

  // Perform collection calls
  useEffect(() => {
    // If we're waiting for the truffled notice approval, don't execute fetch yet
    if (selectedProvider === 'truffled' && localStorage.getItem('truffledNoticeSeen') !== 'true') {
      return;
    }

    const fetchGamesCollection = async () => {
      setIsLoading(true);
      setFetchError('');
      setGames([]);

      try {
        switch (selectedProvider) {
          case 'blox': {
            let data;
            try {
              const response = await fetch('/games/gms.json');
              if (!response.ok) throw new Error();
              data = await response.json();
            } catch (e) {
              const response = await fetch(
                'https://cdn.jsdelivr.net/gh/tharun9772/tharun9772.github.io/games/games.json'
              );
              if (!response.ok) throw new Error('Bloxcraft catalog unreachable');
              data = await response.json();
            }

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'blox',
                name: g.name || 'Game Block',
                cover: g.img || '/1f3ae.png',
                url: g.url,
                isAbsolute: (g.url || '').startsWith('http'),
                addedOrder: index,
              };
            }).filter((g: any) => g && g.name && g.url);
            setGames(parsed);
            break;
          }

          case 'gn-math': {
            const response = await fetch('https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json');
            if (!response.ok) throw new Error('GN-Math records unreachable');
            const data = await response.json();

            const parsed: Game[] = (data || [])
              .filter((g: any) => g.id !== -1 && g.name && !g.name.startsWith('[!]'))
              .map((g: any, index: number) => {
                return {
                  provider: 'gn-math',
                  name: g.name,
                  cover: "https://cdn.jsdelivr.net/gh/freebuisness/covers@main/" + (g.cover || "").replace("{COVER_URL}", ""),
                  url: "/app-viewer/gn-math/?gn-id=" + g.id,
                  isAbsolute: false,
                  addedOrder: index,
                };
              });
            setGames(parsed);
            break;
          }

          case 'elite': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/games.json");
            if (!response.ok) throw new Error('Elite gamez registry inaccessible');
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'elite',
                name: g.title || "Unknown",
                cover: "https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/" + g.image,
                url: "/app-viewer/elite-gamez?url=" + encodeURIComponent(g.url),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'sea-bean': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/sea-bean-unblocked/sde@main/zzz.json");
            if (!response.ok) throw new Error('Sea Bean list unreachable');
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              const cover = (g.cover || "").replace("{COVER_URL}/", "");
              return {
                provider: 'sea-bean',
                name: g.name || "Unknown",
                cover: cover.startsWith("http") ? cover : "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/Icon/" + cover,
                url: "/app-viewer/sea-bean?view=" + encodeURIComponent(g.id),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'ugs': {
            const repos = ["tharun9772/ugs-1", "tharun9772/ugs-2", "tharun9772/ugs-3"];
            let compiledList: Game[] = [];
            let trackerIndex = 0;

            const results = await Promise.allSettled(
              repos.map((repo) => fetch(`https://cdn.jsdelivr.net/gh/tharun9772/game-assets/api_generated/github/${repo}/file.json`))
            );

            for (let i = 0; i < repos.length; i++) {
              const res = results[i];
              if (res.status === 'fulfilled' && res.value.ok) {
                try {
                  const d = await res.value.json();
                  if (Array.isArray(d)) {
                    d.forEach((f: any) => {
                      if (f.type === "file" && f.name?.startsWith("cl") && f.name?.endsWith(".html")) {
                        let cleanName = f.name.replace(/^cl/, "").replace(".html", "");
                        cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

                        compiledList.push({
                          provider: 'ugs',
                          name: cleanName,
                          cover: "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png",
                          url: "/app-viewer/ugs-files?view=" + encodeURIComponent(f.name),
                          isAbsolute: false,
                          addedOrder: trackerIndex++,
                        });
                      }
                    });
                  }
                } catch (e) {
                  console.warn(`UGS parser error for ${repos[i]}:`, e);
                }
              }
            }
            if (compiledList.length === 0) {
              throw new Error('UGS catalog returned empty files');
            }
            setGames(compiledList);
            break;
          }

          case 'seraph': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/DominumNetwork/dominum@main/src/assets/libraries/seraph/games.json");
            if (!response.ok) throw new Error('Seraph game deck offline');
            const data = await response.json();
            const BASE = "https://cdn.jsdelivr.net/gh/a456pur/seraph@main/games/";

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'seraph',
                name: g.name || "Unknown",
                cover: g.img || getFallbackImage(g.name || 'Seraph'),
                url: "/app-viewer/seraph/?view=" + (g.url ? g.url.replace(BASE, "") : ""),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'ckv': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/carbonicality/ChickenKingsVault@main/games.json");
            if (!response.ok) throw new Error("Chicken King's Vault offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'ckv',
                name: g.name || "Unknown",
                cover: g.img ? "https://cdn.jsdelivr.gh/carbonicality/ChickenKingsVault@main/gameimages/" + g.img : getFallbackImage(g.name || 'CKV'),
                url: "/app-viewer/chicken-kings-vault/?view=" + g.html,
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'hydra': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/Hydra-Network/hydra-assets@main/gmes.json");
            if (!response.ok) throw new Error("Hydra Network offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'hydra',
                name: g.title || "Unknown",
                cover: g.thumb ? "https://cdn.jsdelivr.net/gh/Hydra-Network/hydra-assets@main/" + g.thumb : getFallbackImage(g.title || 'Hydra'),
                url: "/app-viewer/hydra-network/?view=" + g.file_name,
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'ccported': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/ccported-stupid-game-lib.json");
            if (!response.ok) throw new Error("CCPorted collection offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              if (!g || !g.base || !g.Id) return null;
              return {
                provider: 'ccported',
                name: g.name || ("Game " + g.Id),
                cover: g.base + "/thumb.jpg",
                url: "/app-viewer/ccported/?view=" + g.Id,
                isAbsolute: false,
                addedOrder: index,
              };
            }).filter(Boolean) as Game[];
            setGames(parsed);
            break;
          }

          case 'googleclass': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/bloxcraft-st/google-class-files@main/assets/games.json");
            if (!response.ok) throw new Error("Google Class Files offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'googleclass',
                name: g.name || "Unknown",
                cover: g.img || getFallbackImage(g.name || 'GoogleClass'),
                url: "/app-viewer/google-class/?view=" + encodeURIComponent(g.url),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'truffled': {
            const isOnline = await verifyTruffledProxy(selectedProxy);
            if (!isOnline) {
              setShowBlockedModal(true);
              setFetchError('Truffled proxy blocked. Please select another proxy endpoint above!');
              setIsLoading(false);
              return;
            }

            const response = await fetch('https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/js/json/g.json');
            if (!response.ok) throw new Error('Truffled records missing');
            const data = await response.json();

            const parsed: Game[] = (data.games || []).map((g: any, index: number) => {
              const thumb = (g.thumbnail || "")
                .replace(/^\/+/, "")
                .replace(/^png\/games\//, "");

              const cleanThumb = thumb
                ? "https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/png/games/" + thumb
                : "/1f3ae.png";

              const embedUrl = g.url
                ? "/sail/embed/#https://truffled.lol/" + g.url.replace(/^\/+/, "")
                : null;

              if (!embedUrl) return null;

              return {
                provider: 'truffled',
                name: g.name || 'Truffled Game',
                cover: cleanThumb,
                url: embedUrl,
                isAbsolute: false,
                addedOrder: index,
              };
            }).filter(Boolean) as Game[];
            setGames(parsed);
            break;
          }

          case 'nowgg': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/nowgg.fun/games.json");
            if (!response.ok) throw new Error("NowGG archive unreachable");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              if (!g.name || !g.url) return null;
              let rawUrl = g.url.trim();
              let cleanUrl = rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl;

              return {
                provider: 'nowgg',
                name: g.name,
                cover: g.img || "/1f3ae.png",
                url: "/sail/embed/#" + cleanUrl,
                isAbsolute: false,
                addedOrder: index,
              };
            }).filter(Boolean) as Game[];
            setGames(parsed);
            break;
          }

          case 'alexrworlds': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/dskjfoisjfsjio/alexrsworld@latest/singlefilegames.json");
            if (!response.ok) throw new Error("Alexrworlds offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: 'alexrworlds',
                name: g.title || "Unknown",
                cover: g.img || "/1f3ae.png",
                url: "/app-viewer/alexr-world-s/?view=" + encodeURIComponent(g.title),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'lupine': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/LupineVault@main/assets/games.json");
            if (!response.ok) throw new Error("LupineVault offline");
            const d = await response.json();

            const parsed: Game[] = (d || []).map((g: any, index: number) => {
              if (!g.name) return null;
              const encodedName = encodeURIComponent(g.name);
              return {
                provider: 'lupine',
                name: g.name,
                cover: `https://cdn.jsdelivr.gh/tharun9772/LupineVault@main/assets/images/games/tile/${encodedName}.png`,
                url: `/app-viewer/LupineVault/?view=${encodedName}`,
                isAbsolute: false,
                addedOrder: index,
              };
            }).filter(Boolean) as Game[];
            setGames(parsed);
            break;
          }

          case '3kh0': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/3kh0/3kh0-assets.json");
            if (!response.ok) throw new Error("3kh0 offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((name: string, index: number) => {
              return {
                provider: '3kh0',
                name: name,
                cover: "https://raw.githack.com/tharun9772/3kh0-assets/main/" + name + "/splash.png",
                url: "/app-viewer/3kh0/?view=" + encodeURIComponent(name),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case '3kh0lite': {
            const response = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/3kh0/3kh0-lite.json");
            if (!response.ok) throw new Error("3kh0 Lite offline");
            const data = await response.json();

            const parsed: Game[] = (data || []).map((g: any, index: number) => {
              return {
                provider: '3kh0lite',
                name: g.title || "Unknown",
                cover: "https://raw.githack.com/3kh0/3kh0-lite/main/" + g.imgSrc,
                url: "/app-viewer/3kh0/lite/?view=" + encodeURIComponent(g.link),
                isAbsolute: false,
                addedOrder: index,
              };
            });
            setGames(parsed);
            break;
          }

          case 'petezah': {
            const response = await fetch('https://cdn.jsdelivr.net/gh/PeteZah-G/singlefile-json@main/search.json');
            if (!response.ok) throw new Error('PeteZah lookup offline');
            const data = await response.json();

            const parsed: Game[] = (data.games || []).map((g: any, index: number) => {
              let finalUrl = g.url || '';
              if (finalUrl && !finalUrl.endsWith('index.html') && !finalUrl.match(/\.\w+$/)) {
                finalUrl = finalUrl.replace(/\/$/, '') + '/index.html';
              }

              return {
                provider: 'petezah',
                name: g.label || 'PeteZah Match',
                cover: g.imageUrl || getFallbackImage(g.label || 'PeteZah'),
                url: finalUrl,
                isAbsolute: (finalUrl || '').startsWith('http'),
                addedOrder: index,
                categories: g.categories || [],
              };
            });
            setGames(parsed);
            break;
          }

          default:
            break;
        }
      } catch (err: any) {
        console.error(err);
        setFetchError(err.message || 'Failure playing provider catalog fetcher');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGamesCollection();
  }, [selectedProvider, selectedProxy]);

  // Filters logic: Query search + Petezah categories
  const filteredAndSortedGames = React.useMemo(() => {
    let result = [...games];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q));
    }

    if (selectedProvider === 'petezah' && selectedCategory !== '') {
      const cat = selectedCategory.toLowerCase();
      result = result.filter((g) => g.categories && g.categories.includes(cat));
    }

    // Apply Sorting logic
    result.sort((a, b) => {
      if (sortMethod === 'a-z') return a.name.localeCompare(b.name);
      if (sortMethod === 'z-a') return b.name.localeCompare(a.name);
      if (sortMethod === 'latest') return b.addedOrder - a.addedOrder;
      if (sortMethod === 'oldest') return a.addedOrder - b.addedOrder;
      return 0;
    });

    return result;
  }, [games, searchQuery, selectedCategory, sortMethod, selectedProvider]);

  const spotlightGame = React.useMemo(() => {
    return filteredAndSortedGames[0] || games[0] || null;
  }, [filteredAndSortedGames, games]);

  const handleQuickFilter = (filterType: string) => {
    if (filterType === 'all') {
      setSearchQuery('');
      setSelectedCategory('');
    } else if (filterType === 'action') {
      setSelectedProvider('petezah');
      setSelectedCategory('action');
      setSearchQuery('');
    } else if (filterType === 'multiplayer') {
      if (selectedProvider === 'petezah') {
        setSelectedCategory('2 player');
        setSearchQuery('');
      } else {
        setSearchQuery('multiplayer');
      }
    } else if (filterType === 'skill') {
      if (selectedProvider === 'petezah') {
        setSelectedCategory('skill');
        setSearchQuery('');
      } else {
        setSearchQuery('skill');
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col pb-12 transition-colors duration-300 selection:bg-cyan-500 selection:text-black">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} onQuickFilter={handleQuickFilter} />

      {/* Primary Dashboard Control Deck */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* Immersive Action Spotlight Banner */}
        {spotlightGame && (
          <div
            id="spotlight-hero-banner"
            className="rounded-2xl border mb-8 relative overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
            style={{
              borderColor: 'var(--border)',
              background: 'radial-gradient(ellipse at top right, rgba(15, 23, 42, 0.95), var(--bg))',
            }}
          >
            <div className="absolute top-0 right-0 w-full md:w-[450px] h-full bg-gradient-to-l from-[var(--accent)]/10 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-lg text-center md:text-left flex-1">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-full mb-4 border border-solid"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]"></span>
                </span>
                Trending Spotlight
              </div>
              <h2 className="text-3xl sm:text-5xl font-black mb-3 tracking-tighter leading-tight text-white uppercase">
                {spotlightGame.name}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed max-w-md">
                Experience high-octane gameplay directly within your browser. Hand-picked unblocked premium mirrors built with zero restrictions. No lag, no limits.
              </p>
              <button
                onClick={() => setActiveGame(spotlightGame)}
                className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer hover:bg-[var(--accent)] select-none bg-white text-black shrink-0"
              >
                PLAY NOW
              </button>
            </div>
            
            {/* Curved rotating 3D visual container showcasing game logo */}
            <div className="ml-auto hidden md:flex h-44 w-60 bg-slate-900 rounded-xl border relative rotate-3 shadow-2xl items-center justify-center overflow-hidden shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/15 z-10 pointer-events-none" />
              {spotlightGame.cover ? (
                <img
                  src={spotlightGame.cover}
                  alt={spotlightGame.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-5xl select-none">🏎️</span>
              )}
            </div>
          </div>
        )}

        <div
          id="control-filter-card"
          className="border rounded-2xl p-4 sm:p-6 mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center relative transition-colors duration-300 backdrop-blur-md"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          {/* Provider Select Dropdown */}
          <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Source Network</label>
            <select
              value={selectedProvider}
              onChange={handleProviderChange}
              className="w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 outline-none select-none cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                color: 'var(--text)',
              }}
            >
              {PROVIDERS.map((prov) => (
                <option
                  key={prov.value}
                  value={prov.value}
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                >
                  {prov.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Truffled Proxy Switcher */}
          {selectedProvider === 'truffled' && (
            <div className="flex-1 min-w-[200px] flex flex-col gap-1.5 animate-in fade-in duration-200">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Proxy Mirror</label>
              <select
                value={selectedProxy}
                onChange={(e) => setSelectedProxy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 outline-none select-none cursor-pointer"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'var(--text)',
                }}
              >
                {TRUFFLED_PROXIES.map((proxy) => (
                  <option
                    key={proxy.value}
                    value={proxy.value}
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                  >
                    {proxy.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional PeteZah Categories Select */}
          {selectedProvider === 'petezah' && (
            <div className="flex-1 min-w-[160px] flex flex-col gap-1.5 animate-in fade-in duration-200">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 outline-none select-none cursor-pointer"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'var(--text)',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Term Box */}
          <div className="flex-2 min-w-[240px] flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Search Games</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 opacity-50" />
              <input
                type="text"
                placeholder="Type game name to filter..."
                value={searchQuery}
                aria-label="Search games"
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  saveSearchQuery(searchQuery);
                  // Allow mouse down selects to complete before closing
                  setTimeout(() => {
                    setIsSearchFocused(false);
                  }, 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveSearchQuery(searchQuery);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 outline-none"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* Suggestions Search History Dropdown */}
            {isSearchFocused && searchHistory.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-2 rounded-xl border p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <span>Recent Searches</span>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input blur
                      setSearchHistory([]);
                      localStorage.removeItem('unblocked-games-search-history');
                    }}
                    className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 normal-case text-[9px] font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  {searchHistory.map((query, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between w-full rounded-lg hover:bg-[var(--surface)] transition-all group"
                    >
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents input blur
                          setSearchQuery(query);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center gap-2.5 text-left flex-1 px-3 py-2 text-xs font-semibold cursor-pointer text-slate-300 hover:text-white"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{query}</span>
                      </button>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents input blur
                          const filtered = searchHistory.filter((_, idx) => idx !== i);
                          setSearchHistory(filtered);
                          localStorage.setItem('unblocked-games-search-history', JSON.stringify(filtered));
                        }}
                        className="p-1 px-2.5 opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500 hover:bg-red-500/10 transition-all cursor-pointer rounded-md mr-1"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Menu Select */}
          <div className="w-full lg:w-44 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Sort Results</label>
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 outline-none select-none cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                color: 'var(--text)',
              }}
            >
              {selectedProvider === 'gn-math' && (
                <>
                  <option value="latest" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                    Latest Added
                  </option>
                  <option value="oldest" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                    Oldest Added
                  </option>
                </>
              )}
              <option value="a-z" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                Alphabetical (A-Z)
              </option>
              <option value="z-a" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
                Complementary (Z-A)
              </option>
            </select>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2.5 select-none">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            Popular Games
          </h2>
          <div className="text-[9px] uppercase font-mono tracking-wider opacity-50 select-none">
            DISCOVERING {filteredAndSortedGames.length} GAMES
          </div>
        </div>

        {/* Central Listing Workspace */}
        {isLoading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-10 h-10 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-mono font-bold tracking-widest uppercase opacity-70">
              Fetching network files...
            </span>
          </div>
        ) : fetchError ? (
          <div
            className="w-full max-w-xl mx-auto py-12 px-6 rounded-2xl border text-center my-12 backdrop-blur-md"
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
          >
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold uppercase tracking-wide text-red-500 mb-2">Network Error</h3>
            <p className="text-xs opacity-80 mb-5 leading-relaxed">{fetchError}</p>
            <button
              onClick={() => setSelectedProvider(selectedProvider)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-solid transition-colors hover:bg-red-500/10 cursor-pointer"
              style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--text)' }}
            >
              Retry Connection
            </button>
          </div>
        ) : filteredAndSortedGames.length === 0 ? (
          <div className="w-full py-24 border border-dashed rounded-2xl text-center" style={{ borderColor: 'var(--border)' }}>
            <Gamepad className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text)' }} />
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-50 mb-1">Grid Empty</h3>
            <p className="text-xs opacity-40">No titles match your active filters or searches.</p>
          </div>
        ) : (
          <div
            id="games-arcade-grid"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-16"
          >
            {filteredAndSortedGames.map((game, idx) => (
              <GameCard
                key={`${game.provider}-${game.name}-${idx}`}
                game={game}
                index={idx}
                onOpen={() => setActiveGame(game)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dynamic Overlay Canvas Deck */}
      <GameModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        selectedProxy={selectedProxy}
      />

      <TruffledNoticeModal
        isOpen={showTruffledNotice}
        onClose={() => {
          localStorage.setItem('truffledNoticeSeen', 'true');
          setShowTruffledNotice(false);
          // Autotrigger load
          setSelectedProvider('truffled');
        }}
      />

      <BlockedModal isOpen={showBlockedModal} onClose={() => setShowBlockedModal(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Immersive Footer segment matching mockup layout template exactly */}
      <footer className="h-14 border-t transition-colors duration-300 bg-slate-950/40 px-4 md:px-8 flex items-center justify-between shrink-0 mt-16" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest select-none">
          © {new Date().getFullYear()} Zenith Portal
        </div>
        <div className="flex gap-1.5 items-center">
          <div className="w-1.5 h-1.5 rounded-full opacity-30" style={{ backgroundColor: 'var(--text)' }}></div>
          <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: 'var(--text)' }}></div>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
        </div>
      </footer>
    </div>
  );
}
