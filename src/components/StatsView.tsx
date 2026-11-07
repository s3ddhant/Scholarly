import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertOctagon,
  BookOpen,
  Database,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DocumentItem, QAInteraction } from '../types';

interface StatsViewProps {
  documents: DocumentItem[];
  interactions: Record<string, QAInteraction[]>;
  onSelectDocument?: (doc: DocumentItem) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  documents,
  interactions,
  onSelectDocument,
}) => {
  // Aggregate stats
  const allQAs = Object.values(interactions).flat();
  const totalQuestions = allQAs.length;

  let totalClaims = 0;
  let fullyGroundedClaims = 0;
  let unsupportedClaims = 0;

  allQAs.forEach((qa) => {
    qa.claims.forEach((claim) => {
      totalClaims++;
      if (claim.status === 'SUPPORTED') fullyGroundedClaims++;
      if (claim.status === 'UNSUPPORTED') unsupportedClaims++;
    });
  });

  const groundedPercentage =
    totalClaims > 0 ? Math.round((fullyGroundedClaims / totalClaims) * 100) : 100;
  const unsupportedPercentage =
    totalClaims > 0 ? Math.round((unsupportedClaims / totalClaims) * 100) : 0;

  const totalChunks = documents.reduce((acc, d) => acc + d.chunks.length, 0);

  return (
    <div id="stats-screen" className="px-4 py-4 space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="bg-[#FAF6EE] border border-black/6 rounded-[24px] p-5 shadow-xs">
        <div className="flex items-center gap-2 text-[#E8543C] mb-2">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Auditing & Grounding Engine
          </span>
        </div>
        <h2 className="font-serif-title font-bold text-xl text-neutral-950 leading-tight">
          Confidence & Grounding Metrics
        </h2>
        <p className="text-xs text-neutral-600 mt-1">
          Every synthesized answer is verified through an independent second-pass system audit
          evaluating claims against retrieved text passages.
        </p>

        {/* Primary score gauge */}
        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
          <div>
            <span className="text-3xl font-serif-title font-bold text-neutral-950">
              {groundedPercentage}%
            </span>
            <span className="text-[11px] text-neutral-500 block font-medium">
              Overall Grounding Rate
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-[#E8543C]">
              {unsupportedPercentage}%
            </span>
            <span className="text-[11px] text-neutral-500 block font-medium">
              Flagged Unsupported
            </span>
          </div>
        </div>
      </div>

      {/* Stacked List Section 1: Audited Claims */}
      <div className="space-y-1.5">
        <div className="px-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Citation Audit Metrics
          </span>
        </div>

        <div className="bg-[#FAF6EE] border border-black/6 rounded-[22px] overflow-hidden divide-y divide-black/5 shadow-2xs">
          {/* Row 1: Total questions asked */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8543C]/10 text-[#E8543C] flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  Total Questions Asked
                </h4>
                <p className="text-[10px] text-neutral-500">
                  User inquiries across all documents
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-serif-title text-neutral-900">
              {totalQuestions}
            </span>
          </div>

          {/* Row 2: % of claims fully grounded */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  % of Claims Fully Grounded
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Supported by explicit source text
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-serif-title text-emerald-800">
              {groundedPercentage}%
            </span>
          </div>

          {/* Row 3: % flagged unsupported */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8543C]/10 text-[#E8543C] flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  % Flagged Unsupported
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Caught by 2nd-stage system verifier
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-serif-title text-[#E8543C]">
              {unsupportedPercentage}%
            </span>
          </div>

          {/* Row 4: Total atomic claims verified */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  Total Claims Evaluated
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Synthesized statements audited
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-serif-title text-neutral-900">
              {totalClaims}
            </span>
          </div>
        </div>
      </div>

      {/* Stacked List Section 2: Library & Indexing */}
      <div className="space-y-1.5">
        <div className="px-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Library & Vector Indexing
          </span>
        </div>

        <div className="bg-[#FAF6EE] border border-black/6 rounded-[22px] overflow-hidden divide-y divide-black/5 shadow-2xs">
          {/* Row 1: Documents in library */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  Documents in Library
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Papers, PDFs and articles cataloged
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-serif-title text-neutral-900">
              {documents.length}
            </span>
          </div>

          {/* Row 2: Vector Chunks */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  Vector Chunks Indexed
                </h4>
                <p className="text-[10px] text-neutral-500">
                  System embedding retrieval partitions
                </p>
              </div>
            </div>
            <span className="text-sm font-bold font-serif-title text-neutral-900">
              {totalChunks}
            </span>
          </div>

          {/* Row 3: Dual Models */}
          <div className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8543C]/10 text-[#E8543C] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 font-sans">
                  Auditing Architecture
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Dual-stage system verification
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#E8543C]">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Per Document Grounding Breakdown */}
      <div className="space-y-1.5">
        <div className="px-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Per-Document Reliability
          </span>
        </div>

        <div className="bg-[#FAF6EE] border border-black/6 rounded-[22px] overflow-hidden divide-y divide-black/5 shadow-2xs">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument && onSelectDocument(doc)}
              className="p-3.5 flex items-center justify-between hover:bg-[#F3EAE0]/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  style={{ backgroundColor: doc.coverColor }}
                  className="w-4 h-6 rounded-xs shrink-0 shadow-2xs"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 font-serif-title truncate group-hover:text-[#E8543C] transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {doc.totalQuestions} questions • {doc.chunks.length} chunks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-neutral-900 font-sans">
                  {doc.groundingScoreAvg}%
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E8543C] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
