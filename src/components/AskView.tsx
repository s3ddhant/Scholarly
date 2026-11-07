import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Star, AlertTriangle, BookOpen, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { DocumentItem, QAInteraction, VerifiedClaim, RetrievedPassage } from '../types';
import { DocumentCover } from './DocumentCover';

interface AskViewProps {
  document: DocumentItem;
  interactions: QAInteraction[];
  onBack: () => void;
  onAskQuestion: (question: string) => Promise<void>;
  isLoading: boolean;
  onOpenPassageViewer: (
    passages: RetrievedPassage[],
    index: number,
    docTitle: string,
    associatedClaim?: VerifiedClaim
  ) => void;
}

export const AskView: React.FC<AskViewProps> = ({
  document,
  interactions,
  onBack,
  onAskQuestion,
  isLoading,
  onOpenPassageViewer,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions: Record<string, string[]> = {
    'doc-vaswani-2017': [
      'Why does the Transformer discard recurrence?',
      'How does Multi-Head Attention calculate outputs?',
      'What were the training benchmark results on WMT 2014?',
    ],
    'doc-bubeck-2023': [
      'What are the key limitations in GPT-4 planning and memory?',
      'How does GPT-4 perform on mathematics and coding?',
      'Does GPT-4 maintain a live continuous world state?',
    ],
    'doc-nature-sustainability': [
      'How much water is evaporated per LLM inference prompt?',
      'How does spatial load shifting reduce AI emissions?',
    ],
  };

  const currentSuggestions = sampleQuestions[document.id] || [
    `What are the core conclusions of ${document.title}?`,
    'What methodology or evidence is presented?',
    'Are there any limitations acknowledged by the author?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const q = inputValue.trim();
    setInputValue('');
    onAskQuestion(q);
  };

  const handleSuggestionClick = (q: string) => {
    if (isLoading) return;
    onAskQuestion(q);
  };

  return (
    <div id="ask-screen" className="flex flex-col min-h-screen bg-[#F5EDE0] pb-24">
      {/* Top Bar with Back Chevron */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#F5EDE0]/95 backdrop-blur-md border-b border-black/5">
        <button
          id="ask-back-button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-[#E8543C] transition-colors p-1.5 -ml-1 rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          <span>Library</span>
        </button>
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          Grounded Q&A
        </span>
        <div className="w-12 text-right">
          <span className="text-[10px] font-bold text-[#E8543C] bg-[#E8543C]/10 px-2 py-0.5 rounded-full">
            {document.chunks.length} Chunks
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6 flex-1">
        {/* Document Detail Header: Cover card at top, title + source centered below it */}
        <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-black/8">
          <DocumentCover
            title={document.title}
            author={document.author}
            source={document.source}
            coverColor={document.coverColor}
            size="md"
            className="w-28 h-40 shadow-lg"
          />

          <div className="max-w-[320px]">
            <h2 className="font-serif-title font-bold text-lg text-neutral-950 leading-snug">
              {document.title}
            </h2>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              {document.author}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {document.source} • {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 text-[11px] font-medium bg-[#FBF8F3] px-3.5 py-1.5 rounded-full border border-black/5">
            <span className="flex items-center gap-1 text-neutral-800">
              <Star className="w-3.5 h-3.5 fill-[#E8543C] text-[#E8543C]" />
              <strong className="font-bold">{document.groundingScoreAvg}%</strong> Grounded
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-600">
              {document.totalQuestions} Questions Asked
            </span>
          </div>
        </div>

        {/* Suggestion Chips if few or no messages */}
        {interactions.length === 0 && (
          <div className="space-y-2 py-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 block text-center">
              Suggested Questions
            </span>
            <div className="space-y-1.5">
              {currentSuggestions.map((sq, i) => (
                <button
                  key={i}
                  id={`suggested-question-${i}`}
                  onClick={() => handleSuggestionClick(sq)}
                  className="w-full text-left p-3 rounded-2xl bg-[#FAF6EE] hover:bg-[#F3EAE0] border border-black/5 text-xs text-neutral-800 font-medium transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{sq}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#E8543C] shrink-0 opacity-70 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q&A Thread */}
        <div id="qa-thread-messages" className="space-y-6">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="space-y-3">
              {/* User Question: Simple right-aligned bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-neutral-900 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs">
                  <p className="text-xs font-medium leading-relaxed">
                    {interaction.question}
                  </p>
                </div>
              </div>

              {/* Gemini Answer: Left-aligned card */}
              <div className="flex justify-start">
                <div className="w-full max-w-[96%] bg-[#FDFBF7] border border-black/8 rounded-2xl rounded-tl-xs p-4 shadow-sm space-y-3.5">
                  {/* Answer Header with Grounding Badge */}
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#E8543C]/10 text-[#E8543C] flex items-center justify-center">
                        <BookOpen className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
                        Scholarly Synthesis
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {interaction.hasUnsupportedClaims ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E8543C] bg-[#E8543C]/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Audit Flagged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>100% Grounded</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Synthesized Answer Text */}
                  <div className="font-serif text-[13px] leading-relaxed text-neutral-900">
                    <p>{interaction.answer}</p>
                  </div>

                  {/* Claims Breakdown with Inline Citation Chips & Unsupported Warning Tags */}
                  <div className="space-y-2 pt-2 border-t border-black/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Audited Claims & Sources
                    </span>

                    <div className="space-y-2">
                      {interaction.claims.map((claim, cIdx) => (
                        <div
                          key={claim.id || cIdx}
                          id={`claim-row-${cIdx}`}
                          className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-colors ${
                            claim.status === 'UNSUPPORTED'
                              ? 'bg-amber-500/5 border-[#E8543C]/40'
                              : 'bg-[#FAF6EE] border-black/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12px] font-medium text-neutral-900 leading-snug">
                              {claim.claimText}
                            </p>

                            {/* Status tag */}
                            {claim.status === 'UNSUPPORTED' ? (
                              <span
                                id={`unsupported-tag-${cIdx}`}
                                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#E8543C] bg-[#E8543C]/15 px-2 py-0.5 rounded-full border border-[#E8543C]/30"
                              >
                                <AlertTriangle className="w-3 h-3" /> Unsupported
                              </span>
                            ) : (
                              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Grounded
                              </span>
                            )}
                          </div>

                          {/* Inline Citation Chip (Tap to reveal exact source passage) */}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {claim.supportingChunkIds.length > 0 ? (
                              claim.supportingChunkIds.map((chunkId, idx) => {
                                const matchedPassageIndex = interaction.retrievedPassages.findIndex(
                                  (p) => p.chunkId === chunkId
                                );
                                const passage = interaction.retrievedPassages[matchedPassageIndex];

                                return (
                                  <button
                                    key={idx}
                                    id={`citation-chip-${cIdx}-${idx}`}
                                    onClick={() =>
                                      onOpenPassageViewer(
                                        interaction.retrievedPassages,
                                        matchedPassageIndex >= 0 ? matchedPassageIndex : 0,
                                        document.title,
                                        claim
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F5EDE0] hover:bg-[#E8543C]/15 text-neutral-800 hover:text-[#E8543C] border border-black/10 transition-colors shadow-2xs group"
                                  >
                                    <Star className="w-2.5 h-2.5 fill-[#E8543C] text-[#E8543C]" />
                                    <span>
                                      Passage {passage?.chunkIndex || idx + 1}
                                      {passage?.page ? ` (p. ${passage.page})` : ''}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 group-hover:text-[#E8543C]">
                                      • Tap to view
                                    </span>
                                  </button>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-[#E8543C] font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> No direct citation in retrieved chunks
                              </span>
                            )}
                          </div>

                          {/* Explanation note */}
                          {claim.explanation && (
                            <p className="text-[10px] text-neutral-500 italic pt-0.5">
                              {claim.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom "View all retrieved passages" button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() =>
                        onOpenPassageViewer(
                          interaction.retrievedPassages,
                          0,
                          document.title
                        )
                      }
                      className="text-[11px] text-neutral-700 underline font-semibold hover:text-[#E8543C] transition-colors"
                    >
                      View All {interaction.retrievedPassages.length} Source Passages
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#FDFBF7] border border-black/8 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-xs text-neutral-700">
                <Loader2 className="w-4 h-4 animate-spin text-[#E8543C]" />
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-900 font-serif-title">
                    Retrieving passages & auditing claims...
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Dual system call: vector synthesis + citation verification
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Pinned Bottom Input */}
      <div
        id="ask-input-bar"
        className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto p-3 pb-2 bg-[#F5EDE0]/95 backdrop-blur-md border-t border-black/8 z-40"
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            id="question-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask a grounded question about "${document.title.slice(0, 20)}..."`}
            className="flex-1 bg-[#FAF6EE] text-xs text-neutral-900 placeholder-neutral-400 px-4 py-3 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#E8543C]/50 transition-all font-medium"
          />

          <button
            type="submit"
            id="send-question-btn"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send question"
            className="w-10 h-10 rounded-full bg-[#E8543C] text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-[#D4432C] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="pt-1.5 text-center">
          <p className="text-[10px] text-neutral-500 font-medium tracking-tight">
            Project by <span className="font-bold text-neutral-800">Siddhant Bhandare</span> •{' '}
            <a
              href="mailto:siddhantbhandare1@gmail.com"
              className="text-[#E8543C] hover:underline font-medium"
            >
              siddhantbhandare1@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
