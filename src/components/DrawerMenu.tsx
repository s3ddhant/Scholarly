import React from 'react';
import { X, BookOpen, BarChart2, ShieldCheck, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { NavTab } from './BottomNav';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onResetSamples: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenUpload,
  onResetSamples,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="drawer-menu-overlay"
      className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="drawer-menu-panel"
        className="w-[300px] bg-[#FDFBF7] h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <h2 className="font-serif-title font-bold text-xl text-neutral-950">
                Scholarly
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8543C]">
                Grounded Research Reader
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigateTab('library');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F3EAE0] text-neutral-900 font-semibold text-xs transition-colors text-left"
            >
              <BookOpen className="w-4 h-4 text-[#E8543C]" />
              <span>Library Home</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('stats');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F3EAE0] text-neutral-900 font-semibold text-xs transition-colors text-left"
            >
              <BarChart2 className="w-4 h-4 text-[#E8543C]" />
              <span>Grounding & Audit Stats</span>
            </button>

            <button
              onClick={() => {
                onOpenUpload();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F3EAE0] text-neutral-900 font-semibold text-xs transition-colors text-left"
            >
              <Plus className="w-4 h-4 text-[#E8543C]" />
              <span>Upload New Document</span>
            </button>
          </div>

          {/* Methodology Card */}
          <div className="p-4 rounded-2xl bg-[#F5EDE0] border border-black/5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[#E8543C] font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>2-Step Verification</span>
            </div>
            <p className="text-[11px] text-neutral-700 leading-relaxed">
              1. Document passages retrieved using vector embeddings.
              <br />
              2. System generates grounded answer.
              <br />
              3. Independent second system audit verifies every atomic claim against retrieved text and flags unsupported statements.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/5 pt-4 space-y-2">
          <div className="text-center text-[11px] text-neutral-600 font-medium">
            <span>Project by </span>
            <span className="font-bold text-neutral-900">Siddhant Bhandare</span>
            <br />
            <a
              href="mailto:siddhantbhandare1@gmail.com"
              className="text-[#E8543C] hover:underline font-semibold text-[10px]"
            >
              siddhantbhandare1@gmail.com
            </a>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset library to default seminal papers and audits?')) {
                onResetSamples();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors pt-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Sample Library</span>
          </button>

          <div className="text-[10px] text-center text-neutral-400 font-medium">
            Powered by System
          </div>
        </div>
      </div>
    </div>
  );
};
