import React, { useState } from 'react';
import { Search as SearchIcon, BookOpen, Star, ChevronRight, X } from 'lucide-react';
import { DocumentItem } from '../types';
import { DocumentCover } from './DocumentCover';

interface SearchViewProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  documents,
  onSelectDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = documents.filter((doc) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesDoc =
      doc.title.toLowerCase().includes(term) ||
      doc.author.toLowerCase().includes(term) ||
      doc.source.toLowerCase().includes(term) ||
      doc.summary.toLowerCase().includes(term);

    const matchesChunk = doc.chunks.some(
      (c) => c.text.toLowerCase().includes(term) || (c.sectionTitle && c.sectionTitle.toLowerCase().includes(term))
    );

    return matchesDoc || matchesChunk;
  });

  return (
    <div id="search-screen" className="px-4 py-4 space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Search Input Bar */}
      <div className="relative">
        <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          id="search-documents-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search papers, authors, theories, or keywords..."
          className="w-full bg-[#FAF6EE] text-xs text-neutral-900 placeholder-neutral-400 pl-11 pr-10 py-3 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#E8543C]/40 font-medium shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          {searchTerm ? `Found ${filtered.length} matching documents` : 'All Indexed Papers'}
        </span>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-[#FAF6EE] rounded-[22px] border border-black/5 p-6">
            <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-700">No documents found</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Try searching by author, topic, or index terms.
            </p>
          </div>
        ) : (
          filtered.map((doc) => (
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
                className="w-18 h-24 rounded-xl shrink-0"
              />

              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="font-serif-title font-bold text-xs text-neutral-950 leading-snug line-clamp-2 group-hover:text-[#E8543C] transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                    {doc.author} • {doc.source}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-700">
                    <Star className="w-2.5 h-2.5 fill-[#E8543C] text-[#E8543C]" />
                    <span>{doc.groundingScoreAvg}% confidence</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E8543C] transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
