import { AIAnalysis } from './ai';
import { Annotation } from '@/src/components/MoveAnnotation';

export interface GameSettings {
  timeControl: number;
  increment: number;
  aiColor: 'w' | 'b' | 'random';
  difficulty: 1 | 2 | 3;
  provider: 'gpt4' | 'claude' | 'gemini';
}

export interface LastMove {
  from: string;
  to: string;
}

export interface GameOver {
  reason: 'checkmate' | 'stalemate' | 'timeout' | 'draw' | 'resignation';
  winner: 'w' | 'b' | null;
}

export interface GameError {
  message: string;
  details?: string;
}

export interface GameState {
  game: any; // chess.js instance
  fen: string;
  history: string[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  turn: 'w' | 'b';
  moveNumber: number;
  timeWhite: number;
  timeBlack: number;
  settings: GameSettings;
  analysis: AIAnalysis | null;
  isThinking: boolean;
  lastMove: LastMove | null;
  gameOver: GameOver | null;
  annotations: Annotation[];
  error: GameError | null;
}

export type GameAction =
  | { type: 'MAKE_MOVE'; payload: { from: string; to: string; newTime: number } }
  | { type: 'MAKE_AI_MOVE'; payload: { move: any; analysis: AIAnalysis } }
  | { type: 'SET_ANALYSIS'; payload: AIAnalysis }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'UNDO_MOVE' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_AI_COLOR'; payload: 'w' | 'b' | 'random' }
  | { type: 'SET_DIFFICULTY'; payload: 1 | 2 | 3 }
  | { type: 'SET_PROVIDER'; payload: 'gpt4' | 'claude' | 'gemini' }
  | { type: 'SET_TIME_CONTROL'; payload: number }
  | { type: 'SET_INCREMENT'; payload: number }
  | { type: 'UPDATE_TIME'; payload: { color: 'w' | 'b'; time: number } }
  | { type: 'GAME_OVER'; payload: { reason: GameOver['reason']; winner: GameOver['winner'] } }
  | { type: 'NAVIGATE_TO_MOVE'; payload: number }
  | { type: 'ADD_ANNOTATION'; payload: Omit<Annotation, 'id' | 'createdAt'> }
  | { type: 'UPDATE_ANNOTATION'; payload: Annotation }
  | { type: 'DELETE_ANNOTATION'; payload: string }
  | { type: 'SET_ERROR'; payload: GameError | null };
