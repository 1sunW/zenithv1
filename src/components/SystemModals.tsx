/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Info, MessageSquare } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TruffledNoticeModal({ isOpen, onClose }: NoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="notice-modal-backdrop"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div
        id="notice-modal-content"
        className="w-full max-w-md border rounded-2xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center mb-4"
          style={{
            borderColor: 'var(--accent)',
            backgroundColor: 'var(--surface)',
            color: 'var(--accent)',
          }}
        >
          <Info className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--accent)' }}>
          Community Notice
        </h3>

        <p className="text-xs md:text-sm font-sans leading-relaxed opacity-80 mb-6 font-medium">
          These games and proxy server resources are maintained by the external **Truffled** community. If you would like a link removed, or seek support, please reach out directly on Discord to the maintainer: <strong className="text-[var(--accent)] font-semibold">dominus.elitus</strong>.
        </p>

        <a
          href="https://discord.gg/vVqY36mzvj"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] transition-all duration-300 shadow-md hover:shadow-[#5865F2]/20 mb-6 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          Join Truffled Discord
        </a>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-sans font-extrabold text-sm uppercase tracking-wider transition-all duration-300 outline-none hover:-translate-y-0.5 shadow-lg active:translate-y-0 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#120b21',
          }}
        >
          I Understand, Continue
        </button>
      </div>
    </div>
  );
}

interface BlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlockedModal({ isOpen, onClose }: BlockedModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="blocked-modal-backdrop"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="blocked-modal-content"
        className="w-full max-w-sm border rounded-2xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full border border-solid border-red-500/30 bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4"
        >
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-base md:text-lg font-bold uppercase tracking-wide mb-2 text-red-500">
          Proxy Blocked!
        </h3>

        <p className="text-xs font-sans leading-relaxed opacity-80 mb-6">
          This proxy endpoint appears to be restricted or unreachable on your current network workspace. Please choose a different proxy from the select dropdown or switch providers!
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
          }}
        >
          Dismiss Alert
        </button>
      </div>
    </div>
  );
}
