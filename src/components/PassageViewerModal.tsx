import React from 'react';
import { X, BookOpen, Star, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { RetrievedPassage, VerifiedClaim } from '../types';

interface PassageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  passages: RetrievedPassage[];
  activePassageIndex: number;
  onSelectPassageIndex: (index: number) => void;
  documentTitle: string;
  associatedClaim?: VerifiedClaim;
}

export const PassageViewerModal: React.FC<PassageViewerModalProps> = ({
  isOpen,
  onClose,
  passages,
  activePassageIndex,
  onSelectPassageIndex,
  documentTitle,
  associatedClaim,
}) => {
  if (!isOpen || passages.length === 0) return null;

  const currentPassage = passages[activePassageIndex] || passages[0];

  // Helper to render text with highlighted snippet
  const renderHighlightedText = (fullText: string, highlight?: string) => {
    if (!highlight || highlight.trim().length === 0) {
      return <span>{fullText}</span>;
    }

    const cleanHighlight = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(`(${cleanHighlight.slice(0, 80)})`, 'i');
      const parts = fullText.split(regex);
      if (parts.length > 1) {
        return parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-[#E8543C]/20 text-neutral-950 font-medium px-1 py-0.5 rounded border-b-2 border-[#E8543C]"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        );
      }
    } catch {
      // Fallback
    }

    // Secondary fallback search if exact match fails
    return (
      <div>
        <div className="mb-3 p-3 bg-[#E8543C]/10 border-l-4 border-[#E8543C] rounded-r-lg">
          <span className="text-xs font-bold text-[#E8543C] block uppercase tracking-wider mb-1">
            Cited Evidence Passage:
          </span>
          <p className="text-sm font-serif-title italic text-neutral-800">
            "{highlight}"
          </p>
        </div>
        <p className="text-sm leading-relaxed text-neutral-700">{fullText}</p>
      </div>
    );
  };

  return (
    <div
      id="passage-viewer-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="passage-viewer-sheet"
        className="w-full max-w-[420px] bg-[#FDFBF7] text-neutral-900 rounded-t-[28px] sm:rounded-[28px] shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar on mobile */}
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-black/5 flex items-center justify-between bg-[#F8F3EA]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E8543C]/10 flex items-center justify-center text-[#E8543C]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                Grounding Source Passage
              </span>
              <h3 className="text-sm font-bold text-neutral-900 font-serif-title line-clamp-1">
                {documentTitle}
              </h3>
            </div>
          </div>
          <button
            id="close-passage-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Associated Claim Card if clicked from a claim */}
        {associatedClaim && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#F5EDE0] border border-black/5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-neutral-500 text-[10px] uppercase tracking-wider">
                Examined Claim
              </span>
              {associatedClaim.status === 'SUPPORTED' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Fully Grounded ({associatedClaim.confidence}%)
                </span>
              ) : associatedClaim.status === 'PARTIALLY_SUPPORTED' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-[#E8543C]" /> Partially Supported ({associatedClaim.confidence}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E8543C] bg-[#E8543C]/10 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Unsupported Claim Flag
                </span>
              )}
            </div>
            <p className="font-medium text-neutral-900 italic">
              "{associatedClaim.claimText}"
            </p>
            {associatedClaim.explanation && (
              <p className="mt-1.5 text-[11px] text-neutral-600 font-sans border-t border-black/5 pt-1.5">
                {associatedClaim.explanation}
              </p>
            )}
          </div>
        )}

        {/* Passage Metadata Bar */}
        <div className="px-5 py-2.5 flex items-center justify-between text-xs text-neutral-500 border-b border-black/5 bg-[#FAF6EE]">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
              Chunk {currentPassage.chunkIndex}
            </span>
            {currentPassage.page && <span>Page {currentPassage.page}</span>}
            {currentPassage.sectionTitle && (
              <span className="truncate max-w-[150px] font-semibold text-neutral-700">
                • {currentPassage.sectionTitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[#E8543C] font-semibold text-[11px]">
            <Star className="w-3 h-3 fill-[#E8543C]" />
            <span>{currentPassage.similarityScore}% match</span>
          </div>
        </div>

        {/* Reading Passage Body */}
        <div className="p-5 overflow-y-auto flex-1 font-serif text-[15px] leading-[1.7] text-neutral-800 bg-[#FDFBF7]">
          {renderHighlightedText(currentPassage.text, currentPassage.highlightSnippet || associatedClaim?.exactQuote)}
        </div>

        {/* Footer with passage pagination */}
        <div className="px-5 py-3 border-t border-black/5 flex items-center justify-between bg-[#F8F3EA]">
          <div className="text-xs text-neutral-500 font-medium">
            Passage {activePassageIndex + 1} of {passages.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="prev-passage-btn"
              disabled={activePassageIndex === 0}
              onClick={() => onSelectPassageIndex(Math.max(0, activePassageIndex - 1))}
              className="p-1.5 rounded-full border border-black/10 text-neutral-700 hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="next-passage-btn"
              disabled={activePassageIndex === passages.length - 1}
              onClick={() => onSelectPassageIndex(Math.min(passages.length - 1, activePassageIndex + 1))}
              className="p-1.5 rounded-full border border-black/10 text-neutral-700 hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="done-passage-btn"
              onClick={onClose}
              className="ml-2 bg-[#E8543C] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#D4432C] transition-colors"
            >
              Close Reading View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
