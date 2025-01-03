export type PositionType = 'equal' | 'white_advantage' | 'black_advantage' | 'white_winning' | 'black_winning';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SuggestedMove {
  move: string;
  explanation: string;
  evaluation?: number;
  confidence?: number;
  isCapture?: boolean;
  isTactical?: boolean;
  variations?: {
    line: string[];
    evaluation: number;
  }[];
}

export interface KeyPoint {
  text: string;
  category: 'tactical' | 'positional' | 'strategic' | 'warning';
  importance: number;
}

export interface AIAnalysis {
  provider: string;
  positionType: PositionType;
  evaluation: number;
  equalityPercentage: number;
  difficulty: Difficulty;
  suggestedMoves: SuggestedMove[];
  keyPoints: string[];
  detailedAnalysis: string;
  confidence: number;
  evaluationHistory?: {
    ply: number;
    evaluation: number;
    bestMove?: string;
  }[];
  threats?: {
    side: 'white' | 'black';
    description: string;
    moves: string[];
  }[];
  positionalFactors?: {
    category: string;
    evaluation: number;
    description: string;
  }[];
}

export interface AIMove {
  move: string;
  explanation: string;
  confidence?: number;
  isCapture?: boolean;
  complexity?: number;
  alternatives?: {
    move: string;
    explanation: string;
    evaluation?: number;
  }[];
  analysis?: AIAnalysis;
}

export type ModelProvider = 'gpt4' | 'claude' | 'gemini';

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  evaluationThreshold?: number;
  systemPrompt?: string;
  analysisDepth?: number;
  considerVariations?: boolean;
  trackHistory?: boolean;
}

export interface AIError {
  code: string;
  message: string;
  provider?: string;
  retryable?: boolean;
  details?: {
    type: string;
    context?: any;
  };
}

export interface DifficultyConfig {
  temperature: number;
  maxDepth: number;
  evaluationThreshold: number;
  preferSimpleMoves: boolean;
  avoidComplexPositions: boolean;
  systemPrompt: string;
  analysisDepth: number;
  considerVariations: boolean;
  confidence: number;
}

export type DifficultySettings = {
  [K in 1 | 2 | 3]: DifficultyConfig;
}; 