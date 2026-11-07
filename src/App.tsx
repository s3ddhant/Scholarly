import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { LibraryView } from './components/LibraryView';
import { AskView } from './components/AskView';
import { StatsView } from './components/StatsView';
import { SearchView } from './components/SearchView';
import { SavedView } from './components/SavedView';
import { UploadModal } from './components/UploadModal';
import { PassageViewerModal } from './components/PassageViewerModal';
import { DrawerMenu } from './components/DrawerMenu';
import { INITIAL_DOCUMENTS, INITIAL_QAS } from './data/sampleDocuments';
import { DocumentItem, QAInteraction, RetrievedPassage, VerifiedClaim } from './types';

const STORAGE_KEY_DOCS = 'scholarly_docs_v1';
const STORAGE_KEY_QAS = 'scholarly_qas_v1';

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DOCUMENTS;
  });

  const [interactions, setInteractions] = useState<Record<string, QAInteraction[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QAS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_QAS;
  });

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('library');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingQA, setIsLoadingQA] = useState(false);

  // Passage viewer modal state
  const [passageViewerState, setPassageViewerState] = useState<{
    isOpen: boolean;
    passages: RetrievedPassage[];
    activeIndex: number;
    docTitle: string;
    associatedClaim?: VerifiedClaim;
  }>({
    isOpen: false,
    passages: [],
    activeIndex: 0,
    docTitle: '',
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QAS, JSON.stringify(interactions));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [interactions]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null;
  const currentDocQAs = selectedDocId ? interactions[selectedDocId] || [] : [];

  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDocId(doc.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLibrary = () => {
    setSelectedDocId(null);
  };

  const handleToggleSave = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isSaved: !d.isSaved } : d))
    );
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
  };

  const handleResetSamples = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setInteractions(INITIAL_QAS);
    setSelectedDocId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_DOCS);
      localStorage.removeItem(STORAGE_KEY_QAS);
    } catch {
      // ignore
    }
  };

  const handleOpenPassageViewer = (
    passages: RetrievedPassage[],
    index: number,
    docTitle: string,
    associatedClaim?: VerifiedClaim
  ) => {
    setPassageViewerState({
      isOpen: true,
      passages,
      activeIndex: index,
      docTitle,
      associatedClaim,
    });
  };

  const handleAskQuestion = async (question: string) => {
    if (!selectedDoc) return;

    setIsLoadingQA(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          documentTitle: selectedDoc.title,
          question,
          chunks: selectedDoc.chunks,
          previousQAs: currentDocQAs.slice(-2),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate answer.');
      }

      const newInteraction: QAInteraction = await res.json();

      // Update interactions
      setInteractions((prev) => ({
        ...prev,
        [selectedDoc.id]: [...(prev[selectedDoc.id] || []), newInteraction],
      }));

      // Update doc stats
      const updatedQAs = [...currentDocQAs, newInteraction];
      const avgScore = Math.round(
        updatedQAs.reduce((acc, curr) => acc + curr.groundingScore, 0) / updatedQAs.length
      );
      const unsupportedCount = updatedQAs.filter((q) => q.hasUnsupportedClaims).length;

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selectedDoc.id
            ? {
                ...d,
                totalQuestions: updatedQAs.length,
                groundingScoreAvg: avgScore,
                unsupportedClaimsCount: unsupportedCount,
              }
            : d
        )
      );
    } catch (err: any) {
      console.error('Ask error:', err);
      alert(`Scholarly research error: ${err.message || 'Unable to connect to system service.'}`);
    } finally {
      setIsLoadingQA(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE4D8] flex justify-center selection:bg-[#E8543C]/20 selection:text-[#E8543C]">
      {/* Mobile-first single column container (max-width ~414px) */}
      <div className="w-full max-w-[414px] min-h-screen bg-[#F5EDE0] text-neutral-900 shadow-2xl relative flex flex-col">
        {/* Header - Shown on top-level tabs */}
        {!selectedDoc ? (
          <Header
            onOpenMenu={() => setIsDrawerOpen(true)}
            onOpenSearch={() => setActiveTab('search')}
          />
        ) : null}

        {/* Main Content Area */}
        <main className="flex-1">
          {selectedDoc ? (
            /* Document Detail / Ask Screen */
            <AskView
              document={selectedDoc}
              interactions={currentDocQAs}
              onBack={handleBackToLibrary}
              onAskQuestion={handleAskQuestion}
              isLoading={isLoadingQA}
              onOpenPassageViewer={handleOpenPassageViewer}
            />
          ) : activeTab === 'library' ? (
            /* Library Screen (Home) */
            <LibraryView
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onOpenUpload={() => setIsUploadOpen(true)}
              onToggleSave={handleToggleSave}
            />
          ) : activeTab === 'search' ? (
            /* Search Screen */
            <SearchView
              documents={documents}
              onSelectDocument={handleSelectDocument}
            />
          ) : activeTab === 'saved' ? (
            /* Saved Screen */
            <SavedView
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onToggleSave={handleToggleSave}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          ) : (
            /* Stats / Confidence Screen */
            <StatsView
              documents={documents}
              interactions={interactions}
              onSelectDocument={handleSelectDocument}
            />
          )}
        </main>

        {/* Bottom Navigation Bar - Only when not in Ask Screen */}
        {!selectedDoc && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Modals & Drawers */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onAddDocument={handleAddDocument}
        />

        <PassageViewerModal
          isOpen={passageViewerState.isOpen}
          onClose={() =>
            setPassageViewerState((prev) => ({ ...prev, isOpen: false }))
          }
          passages={passageViewerState.passages}
          activePassageIndex={passageViewerState.activeIndex}
          onSelectPassageIndex={(index) =>
            setPassageViewerState((prev) => ({ ...prev, activeIndex: index }))
          }
          documentTitle={passageViewerState.docTitle}
          associatedClaim={passageViewerState.associatedClaim}
        />

        <DrawerMenu
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onResetSamples={handleResetSamples}
        />
      </div>
    </div>
  );
}
