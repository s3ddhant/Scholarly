import React from 'react';
import { Bookmark, Star, ChevronRight, BookOpen } from 'lucide-react';
import { DocumentItem } from '../types';
import { DocumentCover } from './DocumentCover';

interface SavedViewProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onToggleSave: (docId: string, e: React.MouseEvent) => void;
  onOpenUpload: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  documents,
  onSelectDocument,
  onToggleSave,
  onOpenUpload,
}) => {
  const savedDocs = documents.filter((d) => d.isSaved);

  return (
    <div id="saved-screen" className="px-4 py-4 space-y-4 pb-24 animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold font-serif-title text-neutral-950">
            Bookmarked Research
          </h2>
          <p className="text-[11px] text-neutral-500">
            {savedDocs.length} saved papers in reading list
          </p>
        </div>
      </div>

      {savedDocs.length === 0 ? (
        <div className="text-center py-12 bg-[#FAF6EE] rounded-[24px] border border-black/5 p-6 space-y-3">
          <Bookmark className="w-8 h-8 text-neutral-300 mx-auto" />
          <div>
            <h3 className="text-xs font-bold text-neutral-800">No saved papers yet</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Bookmark documents from your library to keep them pinned here.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="text-xs font-bold text-[#E8543C] bg-[#E8543C]/10 px-4 py-2 rounded-full hover:bg-[#E8543C]/20 transition-colors"
          >
            Add New Paper
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-3.5 bg-[#FAF6EE] border border-black/6 hover:border-[#E8543C]/40 rounded-[22px] transition-all cursor-pointer flex gap-3.5 items-center group shadow-2xs"
            >
              <DocumentCover
                title={doc.title}
                author={doc.author}
                source={doc.source}
                coverColor={doc.coverColor}
                size="sm"
                className="w-18 h-26 rounded-xl shrink-0"
              />

              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-serif-title font-bold text-xs text-neutral-950 leading-snug line-clamp-2 group-hover:text-[#E8543C] transition-colors">
                      {doc.title}
                    </h4>
                    <button
                      onClick={(e) => onToggleSave(doc.id, e)}
                      className="p-1 -mr-1 text-[#E8543C]"
                    >
                      <Bookmark className="w-4 h-4 fill-[#E8543C]" />
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {doc.author} • {doc.pageCount} pages
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-700">
                    <Star className="w-2.5 h-2.5 fill-[#E8543C] text-[#E8543C]" />
                    <span>{doc.groundingScoreAvg}% grounded</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E8543C] transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
