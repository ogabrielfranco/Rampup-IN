export interface Participant {
  id: string;
  name: string;
  company: string;
  segment: string;
  eventName?: string;
  isHost?: boolean; // New flag to identify hosts in the results
}

export interface ConnectionMatch {
  participant1Id: string;
  participant2Id: string;
  score: number; // 0-100
  reasoning: string;
}

export interface RecommendedConnection {
  partnerId: string;
  score: number;
  reason: string;
}

export interface IndividualScore {
  participantId: string;
  score: number; // 0-100
  potentialConnections: number; // Count of high quality connections
  scoreReasoning?: string; // Short explanation of why this score was assigned
  recommendedConnections?: RecommendedConnection[]; // List of specific connections for this person
}

export type LayoutFormat = 'teatro' | 'sala_aula' | 'mesa_o' | 'conferencia' | 'mesa_u' | 'mesa_t' | 'recepcao' | 'buffet' | 'custom';

export interface AnalysisResult {
  overallScore: number; // 0-100
  summary: string;
  participants: Participant[];
  individualScores: IndividualScore[];
  topMatches: ConnectionMatch[];
  segmentDistribution: { name: string; value: number }[];
  suggestedLayout: LayoutFormat;
  seatingGroups: string[][]; // List of lists of participant IDs representing clusters/tables
}

export enum AppView {
  SELECTION = 'SELECTION',
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

export type AppMode = 'GENERAL' | 'HOST';