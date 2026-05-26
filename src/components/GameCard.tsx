/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Game } from '../types';
import { Eye, Gamepad } from 'lucide-react';

interface GameCardProps {
  key?: string;
  game: Game;
  index: number;
  onOpen: () => void;
}

export default function GameCard({ game, index, onOpen }: GameCardProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    const currentRef = cardRef.current;

    if (currentRef) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Set cover image once card enters viewport
              setImageSrc(game.cover);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px', threshold: 0.1 }
      );

      observer.observe(currentRef);
    }

    return () => {
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [game.cover]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const cleanName = game.name || 'Unnamed Game';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier
        delay: Math.min(index * 0.02, 0.4),
      }}
      whileHover={{
        y: -6,
        scale: 1.03,
        borderColor: 'var(--accent)',
        boxShadow: '0 12px 24px rgba(122, 92, 255, 0.25)',
      }}
      onClick={onOpen}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-solid transition-all duration-300 backdrop-blur-md cursor-pointer select-none"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Background Glow Ring */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[var(--accent)] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

      {/* Grid Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/40 border-b border-solid" style={{ borderColor: 'var(--border)' }}>
        {/* Play Icon Overlay On Hover */}
        <div className="absolute inset-x-0 bottom-0 top-0 z-10 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Gamepad className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-bold tracking-widest text-[#a855f7] uppercase mt-2">
            LAUNCH ARCADE
          </span>
        </div>

        {/* Lazy Loaded Image */}
        {imageSrc ? (
          <img
            src={imageSrc}
            onLoad={handleImageLoad}
            alt={cleanName}
            referrerPolicy="no-referrer"
            className={`h-full w-full object-cover transition-all duration-700 ${
              isLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-95 blur-md'
            }`}
          />
        ) : (
          <div className="w-full h-full animate-pulse flex items-center justify-center opacity-30">
            <span className="text-xs font-mono">LOADING...</span>
          </div>
        )}
      </div>

      {/* Card Details / Actions */}
      <div className="p-3 w-full flex items-center justify-between gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="text-left text-xs font-bold font-sans tracking-tight truncate flex-1 group-hover:text-[var(--accent)] transition-colors text-ellipsis overflow-hidden "
          style={{ color: 'var(--text)' }}
          title={cleanName}
        >
          {cleanName}
        </button>
        <span
          className="text-[9px] font-mono opacity-50 px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shrink-0"
          style={{ border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          <Eye className="w-2.5 h-2.5" /> {game.provider}
        </span>
      </div>
    </motion.div>
  );
}
