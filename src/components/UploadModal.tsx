import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Sparkles, Check, ArrowRight, Loader2, BookPlus } from 'lucide-react';
import { DocumentItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: DocumentItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'text' | 'curated'>('pdf');
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessDocument = async (payload: {
    text?: string;
    fileBase64?: string;
    mimeType?: string;
    filename?: string;
  }) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      setProcessStep('Extracting metadata & semantic text with system...');

      const extractRes = await fetch('/api/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!extractRes.ok) {
        const err = await extractRes.json();
        throw new Error(err.error || 'Failed to extract document.');
      }

      const extractedDoc: DocumentItem = await extractRes.json();

      setProcessStep('Generating system vector retrieval embeddings...');

      // Call embed endpoint
      const embedRes = await fetch('/api/embed-chunks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks: extractedDoc.chunks }),
      });

      if (embedRes.ok) {
        const { embeddings } = await embedRes.json();
        if (Array.isArray(embeddings)) {
          extractedDoc.chunks = extractedDoc.chunks.map((chunk, i) => ({
            ...chunk,
            embedding: embeddings[i] || [],
          }));
        }
      }

      setProcessStep('Indexing document in Scholarly library...');
      setTimeout(() => {
        onAddDocument(extractedDoc);
        setIsProcessing(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Document processing error:', err);
      setErrorMsg(err.message || 'Error parsing document. Please check your system configuration or try plain text.');
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await handleProcessDocument({
          fileBase64: base64,
          mimeType: 'application/pdf',
          filename: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text or markdown
      const text = await file.text();
      await handleProcessDocument({
        text,
        filename: file.name,
      });
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    await handleProcessDocument({
      text: pastedText,
      filename: pastedTitle.trim() || undefined,
    });
  };

  const handleSelectCurated = async (preset: { title: string; author: string; text: string }) => {
    await handleProcessDocument({
      text: preset.text,
      filename: preset.title,
    });
  };

  const curatedPresets = [
    {
      title: 'Constitutional AI: Harmlessness from AI Feedback',
      author: 'Bai et al., Anthropic (2022)',
      text: `Constitutional AI: Harmlessness from AI Feedback
Yuntao Bai, Saurav Kadavath, Sandra Chen, Amanda Askell, John Aslanides, et al.

Abstract:
As large language models scale, developing techniques to steer them toward helpfulness and harmlessness without extensive human feedback is paramount. We investigate "Constitutional AI", an approach for training a harmless AI assistant through self-improvement, without any human feedback labels for harmfulness. 

Methodology:
The method operates in two phases: supervised learning (critique and revision) and reinforcement learning from AI feedback (RLAIF). In the critique phase, the model generates responses to red-teaming prompts. The model is then prompted to critique its own response according to a short set of principles (a "constitution") and revise the response to remove harmful or biased content. In the RLAIF phase, the model evaluates candidate responses and produces preferences used to train a preference model, which then trains an RL policy.

Key Findings:
We show that Constitutional AI enables models to reject harmful queries politely while preserving helpfulness. The model significantly reduces sycophancy, avoids offensive content, and clarifies reasoning before issuing sensitive refusals.`,
    },
    {
      title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      author: 'Wei, Wang, Schuurmans, Bosma, et al., Google Research (2022)',
      text: `Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Fei Xia, Ed Chi, Quoc V. Le, Denny Zhou

Abstract:
We explore how generating a chain of thought—a series of intermediate natural language reasoning steps—significantly improves the ability of large language models to perform complex reasoning. In particular, we show how such reasoning abilities emerge naturally in sufficiently large language models via a simple method called chain-of-thought prompting, where a few chain of thought demonstrations are provided as exemplars in prompting.

Experiments:
Experiments on arithmetic, symbolic, and commonsense reasoning benchmarks demonstrate that chain-of-thought prompting elicits emergent reasoning capabilities that are not present with standard prompting. For instance, prompting a PaLM 540B with just eight chain-of-thought exemplars achieves state-of-the-art accuracy on the GSM8K benchmark of math word problems, surpassing even fine-tuned GPT-3 with a verifier.

Properties of Chain-of-Thought:
1. It decomposes multi-step problems into intermediate steps, allocating additional computation to difficult problems.
2. It provides an interpretable window into the model's behavior, allowing users to trace how a specific conclusion was derived.
3. Chain-of-thought reasoning is an emergent property: it fails to improve performance for models smaller than ~100 billion parameters, but shows dramatic jumps in performance for frontier-scale models.`,
    },
  ];

  return (
    <div
      id="upload-modal-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="upload-modal-container"
        className="w-full max-w-[420px] bg-[#FDFBF7] text-neutral-900 rounded-t-[28px] sm:rounded-[28px] shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between bg-[#F8F3EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8543C]/15 flex items-center justify-center text-[#E8543C]">
              <BookPlus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title text-neutral-950">
                Add to Research Library
              </h3>
              <p className="text-[11px] text-neutral-500">
                Auto-generate cover, chunks & vector index
              </p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-black/5 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#E8543C]/10 flex items-center justify-center text-[#E8543C] animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <Sparkles className="w-4 h-4 text-[#E8543C] absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div>
              <h4 className="font-serif-title font-bold text-lg text-neutral-900">
                Analyzing Document
              </h4>
              <p className="text-xs text-neutral-600 mt-1 max-w-[280px]">
                {processStep}
              </p>
            </div>
            <div className="w-48 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8543C] rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '75%' }} />
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-black/5 px-4 pt-2 bg-[#FAF6EE]">
              <button
                id="tab-upload-pdf"
                onClick={() => setActiveTab('pdf')}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'pdf'
                    ? 'border-[#E8543C] text-[#E8543C]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload PDF
              </button>
              <button
                id="tab-paste-text"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'text'
                    ? 'border-[#E8543C] text-[#E8543C]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Paste Text
              </button>
              <button
                id="tab-curated"
                onClick={() => setActiveTab('curated')}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'curated'
                    ? 'border-[#E8543C] text-[#E8543C]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Sample Papers
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Tab 1: PDF Upload */}
            {activeTab === 'pdf' && (
              <div className="p-5 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-file-input"
                />

                <div
                  id="pdf-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E8543C]/40 hover:border-[#E8543C] bg-[#F8F3EA]/60 hover:bg-[#F5EDE0] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E8543C]/10 text-[#E8543C] flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold font-serif-title text-neutral-900">
                    Tap to upload a PDF or paper
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-[220px]">
                    System will automatically extract titles, author, text passages, and create vector embeddings.
                  </p>
                  <span className="mt-4 text-[11px] font-bold text-[#E8543C] bg-[#E8543C]/10 px-3 py-1 rounded-full">
                    Select PDF / Paper
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-neutral-500">
                    Supports academic papers, reports, essays, articles
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Paste Text */}
            {activeTab === 'text' && (
              <form onSubmit={handleTextSubmit} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="paste-title-input"
                    placeholder="e.g. Survey of Quantum Computing Algorithms"
                    value={pastedTitle}
                    onChange={(e) => setPastedTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-black/10 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E8543C]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Document Content / Article Text
                  </label>
                  <textarea
                    id="paste-content-input"
                    rows={6}
                    placeholder="Paste article, abstract, or paper body here..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-black/10 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E8543C]/40 font-serif leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-pasted-text-btn"
                  disabled={!pastedText.trim()}
                  className="w-full bg-[#E8543C] text-white font-bold rounded-full py-3 text-xs hover:bg-[#D4432C] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <span>Build Library Index</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Tab 3: Curated Sample Papers */}
            {activeTab === 'curated' && (
              <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
                <p className="text-xs text-neutral-600 px-1">
                  Instantly import seminal research papers pre-formatted for grounded citation tests:
                </p>
                {curatedPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    id={`curated-paper-${idx}`}
                    onClick={() => handleSelectCurated(preset)}
                    className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-black/5 hover:border-[#E8543C]/40 hover:bg-[#F3EAE0] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold font-serif-title text-neutral-950 group-hover:text-[#E8543C] transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                        {preset.author}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Full text ready for indexing</span>
                      <span className="font-bold text-[#E8543C] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Index Now <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
