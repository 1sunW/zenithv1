/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../types';
import { X, Maximize2, Download, ExternalLink, RefreshCw } from 'lucide-react';

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
  selectedProxy: string;
}

export default function GameModal({ game, onClose, selectedProxy }: GameModalProps) {
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string>('');
  const [popupBlocked, setPopupBlocked] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!game) {
      setIframeSrc('');
      setErrorStatus('');
      setPopupBlocked(false);
      return;
    }

    setIsLoading(true);
    setErrorStatus('');
    setPopupBlocked(false);

    let fullUrl = game.url;

    // GN-Math relative URL resolver
    if (game.provider === 'gn-math' && !game.isAbsolute) {
      fullUrl = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main/' + game.url.replace('{HTML_URL}', '');
    }

    const needsBlobFix = ['blox', 'elite', 'sea-bean', 'ugs', 'gn-math', 'seraph', 'petezah'];

    const loadGameSrc = async () => {
      if (needsBlobFix.includes(game.provider)) {
        try {
          const response = await fetch(fullUrl);
          if (!response.ok) throw new Error('Network or CORS error');
          let htmlContent = await response.text();

          // Apply PeteZah base URL redirection for relative assets
          if (game.provider === 'petezah') {
            const baseUrl = fullUrl.replace(/\/([^\/]*)$/, '/');
            if (!/<head[^>]*>/i.test(htmlContent)) {
              htmlContent = htmlContent.replace(/<html[^>]*>/i, `$&<head><base href="${baseUrl}"></head>`);
            } else {
              htmlContent = htmlContent.replace(/<head[^>]*>/i, `$&<base href="${baseUrl}">`);
            }
          }

          const blob = new Blob([htmlContent], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          setIframeSrc(blobUrl);
        } catch (e) {
          console.warn('Blob fetch failed, falling back to direct CORS binding:', e);
          setIframeSrc(fullUrl);
        } finally {
          setIsLoading(false);
        }
      } else if (game.provider === 'truffled') {
        const proxyBase = selectedProxy.replace(/\/$/, '');
        if (game.frameType === 'unity') {
          setIframeSrc(`${proxyBase}/unityframe.html?url=${encodeURIComponent(game.rawUrl || game.url)}`);
        } else {
          setIframeSrc(game.url);
        }
        setIsLoading(false);
      } else {
        setIframeSrc(fullUrl);
        setIsLoading(false);
      }
    };

    loadGameSrc();

    return () => {
      // Cleanup blob URLs on unmount/re-load
      if (iframeSrc.startsWith('blob:')) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [game, selectedProxy]);

  if (!game) return null;

  // Clean-up iframe loading spinner state on load event
  const handleIframeLoaded = () => {
    setIsLoading(false);
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request rejected or blocked:', err);
      });
    }
  };

  const handleDownload = async () => {
    let fileContent = '';
    let fullUrl = game.url;

    if (game.provider === 'gn-math' && !game.isAbsolute) {
      fullUrl = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main/' + game.url.replace('{HTML_URL}', '');
    }

    try {
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('CORS or network blockage');
      fileContent = await response.text();
    } catch (e) {
      // Fallback single-file HTML embed wrapper
      fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${game.name}</title>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${fullUrl}" allowfullscreen="true"></iframe>
</body>
</html>`;
    }

    const blob = new Blob([fileContent], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${game.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleOpenBlankTab = () => {
    if (!iframeSrc) return;

    const blankWin = window.open('about:blank', '_blank');

    if (!blankWin) {
      setPopupBlocked(true);
      return;
    }

    const doc = blankWin.document;
    doc.open();
    // Injects an clean document with an iframe, disguised as Google Drive
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Google Drive</title>
        <link rel="icon" href="https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png">
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            width: 100vw; 
            height: 100vh; 
            overflow: hidden; 
            background-color: #000; 
          }
          iframe { 
            width: 100%; 
            height: 100%; 
            border: none; 
          }
        </style>
      </head>
      <body>
        <iframe src="${iframeSrc}" allowfullscreen="true"></iframe>
      </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div
      id="game-overlay"
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 flex flex-col justify-center items-center p-2 sm:p-6 md:p-8 animate-in fade-in duration-300"
    >
      <div
        id="game-modal-deck"
        className="w-full max-w-7xl h-[95vh] sm:h-[88vh] border rounded-2xl flex flex-col overflow-hidden shadow-2xl relative"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        {/* Fullscreen Modal Header */}
        <div
          id="game-modal-header"
          className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-b shrink-0"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate uppercase max-w-[200px] sm:max-w-[400px]">
              {game.name}
            </h2>
            <span
              className="hidden lg:inline text-[9px] font-mono tracking-wider px-2 py-0.5 rounded border uppercase"
              style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              PROVIDER: {game.provider}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Open In Sandboxed New Tab */}
            <button
              onClick={handleOpenBlankTab}
              className="p-1.5 sm:p-2.5 rounded-lg border border-solid hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              title="Open Stealth Cloaked Tab (about:blank)"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Download Offline */}
            {game.provider !== 'blox' && (
              <button
                onClick={handleDownload}
                className="p-1.5 sm:p-2.5 rounded-lg border border-solid hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center cursor-pointer"
                style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                title="Download Standalone offline html file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Request Fullscreen */}
            <button
              onClick={handleFullscreen}
              className="p-1.5 sm:p-2.5 rounded-lg border border-solid hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              title="Fullscreen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Quit Game Modal */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2.5 rounded-lg border border-solid bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border-red-500/20 cursor-pointer"
              title="Close Panel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* sandboxed iframe canvas container */}
        <div id="game-frame-container" className="flex-1 relative bg-black w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-black/80 z-20">
              <RefreshCw className="w-8 h-8 text-[var(--accent)] animate-spin" />
              <span className="text-xs font-mono tracking-widest uppercase opacity-70">
                BUFFING GRAPHICS PANEL...
              </span>
            </div>
          )}

          {popupBlocked && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl px-4 py-2.5 z-30 text-xs text-center flex flex-col sm:flex-row items-center gap-2 max-w-md shadow-lg backdrop-blur">
              <span>⚠️ Pop-ups blocked! Please allow pop-ups to open in about:blank.</span>
              <button
                onClick={() => setPopupBlocked(false)}
                className="underline font-bold ml-2 uppercase shrink-0 text-[10px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {iframeSrc ? (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              id="game-canvas-iframe"
              onLoad={handleIframeLoaded}
              allowFullScreen
              allow="autoplay; gamepad; keyboard"
              className="w-full h-full border-none outline-none relative z-10"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-mono opacity-60">NO RESOURCE SOURCE RECEIVED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
