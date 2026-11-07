import React from 'react';
import { Menu, Search, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
  onBack?: () => void;
  showBackChevron?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenSearch,
  onBack,
  showBackChevron = false,
  rightAction,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-[#F5EDE0]/95 backdrop-blur-md border-b border-black/5"
    >
      <div className="w-9 flex items-center justify-start">
        {showBackChevron ? (
          <button
            id="header-back-btn"
            onClick={onBack}
            aria-label="Back"
            className="p-1.5 -ml-1 text-neutral-800 hover:text-[#E8543C] transition-colors rounded-full hover:bg-black/5 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        ) : (
          <button
            id="header-menu-btn"
            onClick={onOpenMenu}
            aria-label="Menu"
            className="p-1.5 -ml-1 text-neutral-800 hover:text-[#E8543C] transition-colors rounded-full hover:bg-black/5 active:scale-95"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
      </div>

      <div className="text-center select-none">
        <h1
          id="app-wordmark"
          className="font-serif-title text-2xl font-bold tracking-tight text-neutral-950"
        >
          Scholarly
        </h1>
      </div>

      <div className="w-9 flex items-center justify-end">
        {rightAction ? (
          rightAction
        ) : onOpenSearch ? (
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            aria-label="Search"
            className="p-1.5 -mr-1 text-neutral-800 hover:text-[#E8543C] transition-colors rounded-full hover:bg-black/5 active:scale-95"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>
    </header>
  );
};
