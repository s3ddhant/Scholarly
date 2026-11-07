import React from 'react';
import { Plus, Star, BookOpen, Clock, ChevronRight, Bookmark } from 'lucide-react';
import { DocumentItem } from '../types';
import { DocumentCover } from './DocumentCover';

interface LibraryViewProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onOpenUpload: () => void;
  onToggleSave: (docId: string, e: React.MouseEvent) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  documents,
  onSelectDocument,
  onOpenUpload,
  onToggleSave,
}) => {
  // Sort documents for the "Popular" horizontal row
  const popularDocuments = [...documents].sort(
    (a, b) => b.totalQuestions - a.totalQuestions
  );

  return (
    <div id="library-screen" className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Featured Hero Card at top: bold mustard-yellow block */}
      <section className="px-4 pt-1">
        <div
          id="featured-hero-card"
          className="relative overflow-hidden rounded-[26px] bg-[#E3A836] text-neutral-950 p-6 shadow-sm flex flex-col justify-between min-h-[170px]"
        >
          {/* Subtle background geometric watermark */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <BookOpen className="w-44 h-44 stroke-[1.2]" />
          </div>

          <div className="z-10 max-w-[250px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-900/70 block mb-1">
              Scholarly AI Research
            </span>
            <h2 className="font-serif-title text-2xl font-bold leading-tight tracking-tight text-neutral-950">
              Ask anything. Get grounded answers.
            </h2>
            <p className="text-xs text-neutral-900/80 mt-1 font-medium">
              Every sentence audited against source chunks.
            </p>
          </div>

          <div className="z-10 mt-4">
            <button
              id="hero-upload-cta-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 bg-[#E8543C] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:bg-[#D4432C] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </section>

      {/* "Popular"-style Horizontal Scroll Row */}
      {popularDocuments.length > 0 && (
        <section className="space-y-2.5">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-sans">
              Recently Asked
            </h3>
            <span className="text-[11px] text-neutral-400 font-medium">
              {popularDocuments.length} active papers
            </span>
          </div>

          <div
            id="popular-horizontal-scroll"
            className="flex gap-3 overflow-x-auto px-4 pb-2 pt-0.5 no-scrollbar snap-x"
          >
            {popularDocuments.map((doc) => (
              <div
                key={doc.id}
                id={`popular-card-${doc.id}`}
                onClick={() => onSelectDocument(doc)}
                className="snap-start shrink-0 cursor-pointer group flex flex-col w-28 text-left"
              >
                <div className="relative">
                  <DocumentCover
                    title={doc.title}
                    author={doc.author}
                    source={doc.source}
                    coverColor={doc.coverColor}
                    size="sm"
                    className="w-28 h-36 rounded-xl"
                  />
                  {doc.groundingScoreAvg > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-[#E8543C] text-[#E8543C]" />
                      <span>{doc.groundingScoreAvg}%</span>
                    </div>
                  )}
                </div>
                <h4 className="mt-1.5 font-serif-title font-bold text-xs text-neutral-900 line-clamp-1 group-hover:text-[#E8543C] transition-colors">
                  {doc.title}
                </h4>
                <p className="text-[10px] text-neutral-500 font-medium line-clamp-1">
                  {doc.totalQuestions} {doc.totalQuestions === 1 ? 'question' : 'questions'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Library: Vertical List of Book-Style Cards */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-sans">
            Personal Library
          </h3>
          <button
            onClick={onOpenUpload}
            className="text-xs text-neutral-700 underline font-medium hover:text-[#E8543C]"
          >
            + Add Paper
          </button>
        </div>

        <div className="space-y-3" id="library-vertical-list">
          {documents.map((doc) => (
            <div
              key={doc.id}
              id={`doc-card-${doc.id}`}
              onClick={() => onSelectDocument(doc)}
              className="p-3.5 bg-[#FAF6EE] border border-black/6 hover:border-[#E8543C]/40 rounded-[22px] transition-all cursor-pointer flex gap-3.5 items-center group relative shadow-xs hover:shadow-sm"
            >
              {/* Rounded cover block (auto-colored per document) */}
              <DocumentCover
                title={doc.title}
                author={doc.author}
                source={doc.source}
                coverColor={doc.coverColor}
                size="sm"
                className="w-20 h-28 rounded-xl shrink-0"
              />

              {/* Document details */}
              <div className="flex-1 min-w-0 pr-1 py-0.5 flex flex-col justify-between h-28">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-serif-title font-bold text-sm text-neutral-950 leading-snug line-clamp-2 group-hover:text-[#E8543C] transition-colors">
                      {doc.title}
                    </h4>
                    <button
                      onClick={(e) => onToggleSave(doc.id, e)}
                      className="p-1 -mr-1 text-neutral-400 hover:text-[#E8543C] transition-colors"
                      aria-label="Save document"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          doc.isSaved ? 'fill-[#E8543C] text-[#E8543C]' : 'stroke-[1.8]'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 font-medium line-clamp-1 mt-0.5">
                    {doc.source} • {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
                  </p>
                  <p className="text-[11px] text-neutral-600 line-clamp-1 mt-1 font-serif italic">
                    "{doc.summary}"
                  </p>
                </div>

                {/* Inline Grounding Confidence Indicator */}
                <div className="flex items-center justify-between pt-1 border-t border-black/5 mt-auto">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700">
                    <Star className="w-3 h-3 fill-[#E8543C] text-[#E8543C]" />
                    <span>{doc.groundingScoreAvg}% confidence</span>
                  </div>
                  <div className="flex items-center text-[10px] text-neutral-400 font-medium group-hover:text-[#E8543C] transition-colors">
                    <span>Ask document</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
