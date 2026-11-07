export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  text: string;
  page?: number;
  sectionTitle?: string;
  embedding?: number[];
}

export interface DocumentItem {
  id: string;
  title: string;
  author: string;
  source: string;
  pageCount: number;
  summary: string;
  coverColor: string; // e.g. #705847, #3D5A50, #9E4736, #3B4B69
  coverPattern?: string;
  createdAt: number;
  chunks: DocumentChunk[];
  totalQuestions: number;
  groundingScoreAvg: number; // 0 - 100
  unsupportedClaimsCount: number;
  isSaved?: boolean;
}

export type ClaimStatus = 'SUPPORTED' | 'UNSUPPORTED' | 'PARTIALLY_SUPPORTED';

export interface VerifiedClaim {
  id: string;
  claimText: string;
  status: ClaimStatus;
  confidence: number; // 0 - 100
  supportingChunkIds: string[];
  exactQuote?: string;
  explanation: string;
}

export interface RetrievedPassage {
  chunkId: string;
  chunkIndex: number;
  page?: number;
  sectionTitle?: string;
  text: string;
  similarityScore: number;
  highlightSnippet?: string;
}

export interface QAInteraction {
  id: string;
  documentId: string;
  question: string;
  timestamp: number;
  answer: string;
  claims: VerifiedClaim[];
  groundingScore: number; // percentage
  hasUnsupportedClaims: boolean;
  retrievedPassages: RetrievedPassage[];
}

export interface AppStats {
  totalQuestions: number;
  totalClaimsEvaluated: number;
  groundedClaimsCount: number;
  unsupportedClaimsCount: number;
  overallGroundingPercentage: number;
  documentsCount: number;
  avgSimilarityScore: number;
}
