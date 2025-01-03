"use client"

import { createContext, useContext, ReactNode, useMemo, useReducer, useEffect, useCallback, useState } from 'react';
import { GameState, GameSettings, GameAction } from '../types/chess';
import { gameReducer, initialState } from '../reducers/gameReducer';
import { AIService } from '../services/aiService';
import { Chess } from 'chess.js';
import { AIError } from '../types/ai';
import type { Annotation } from '@/src/components/MoveAnnotation';

interface GameContextType {
  state: GameState;
  settings: GameSettings;
  dispatch: React.Dispatch<GameAction>;
  makeMove: (from: string, to: string) => Promise<boolean>;
  undoMove: () => void;
  resetGame: () => void;
  setAIColor: (color: 'w' | 'b' | 'random') => void;
  setDifficulty: (level: 1 | 2 | 3) => void;
  setProvider: (provider: 'gpt4' | 'claude' | 'gemini') => void;
  setTimeControl: (minutes: number) => void;
  setIncrement: (seconds: number) => void;
  error: AIError | null;
  clearError: () => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  updateAnnotation: (annotation: Annotation) => void;
  deleteAnnotation: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [error, setError] = useState<AIError | null>(null);
  const aiService = useMemo(() => new AIService(), []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Timer effect with improved handling
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const shouldRunTimer = 
      !state.isCheckmate && 
      !state.isDraw && 
      !state.isThinking && // Pause during AI thinking
      state.timeWhite > 0 && 
      state.timeBlack > 0; // Check for time forfeit

    if (shouldRunTimer) {
      timer = setInterval(() => {
        const currentTime = state.turn === 'w' ? state.timeWhite : state.timeBlack;
        
        if (currentTime <= 0) {
          // Handle time forfeit
          dispatch({ 
            type: 'GAME_OVER', 
            payload: { 
              reason: 'timeout', 
              winner: state.turn === 'w' ? 'b' : 'w' 
            } 
          });
        } else {
          dispatch({
            type: 'UPDATE_TIME',
            payload: {
              color: state.turn,
              time: currentTime - 1
            }
          });
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    state.turn, 
    state.isCheckmate, 
    state.isDraw, 
    state.isThinking,
    state.timeWhite,
    state.timeBlack
  ]);

  // Improved move handling with increment and race condition prevention
  const makeMove = useCallback(async (from: string, to: string): Promise<boolean> => {
    try {
      // Prevent moves during thinking state
      if (state.isThinking) return false;

      const game = new Chess(state.fen);
      
      // Validate move before attempting
      if (!game.moves({ verbose: true }).some(m => m.from === from && m.to === to)) {
        return false;
      }

      const move = game.move({ from, to, promotion: 'q' });
      if (!move) return false;

      // Add increment before dispatching move
      const currentTime = state.turn === 'w' ? state.timeWhite : state.timeBlack;
      const timeWithIncrement = currentTime + state.settings.increment;

      dispatch({
        type: 'MAKE_MOVE',
        payload: { 
          from,
          to,
          newTime: timeWithIncrement
        }
      });

      // If game is over, no need to trigger AI move
      if (game.isGameOver()) return true;

      // If it's AI's turn, trigger AI move
      if (game.turn() === state.settings.aiColor) {
        dispatch({ type: 'SET_THINKING', payload: true });
        try {
          const aiMoveResult = await aiService.getMove(game, state.settings);
          console.log("AI move result:", aiMoveResult);
          
          if (aiMoveResult && aiMoveResult.move) {
            // Create a new game instance to validate and make the move
            const aiGame = new Chess(game.fen());
            const [from, to] = aiMoveResult.move.match(/[a-h][1-8]/g) || [];
            console.log("Parsed move:", { from, to });
            
            if (from && to) {
              const aiMove = aiGame.move({ from, to, promotion: 'q' });
              if (aiMove) {
                console.log("Analysis before dispatch:", aiMoveResult.analysis);
                // First dispatch the analysis if we have it
                if (aiMoveResult.analysis) {
                  dispatch({
                    type: 'SET_ANALYSIS',
                    payload: aiMoveResult.analysis
                  });
                }
                
                // Then make the move
                dispatch({
                  type: 'MAKE_AI_MOVE',
                  payload: { 
                    move: aiMove,
                    analysis: aiMoveResult.analysis || {
                      provider: state.settings.provider,
                      positionType: 'equal',
                      evaluation: 0,
                      equalityPercentage: 50,
                      difficulty: 'intermediate',
                      suggestedMoves: [],
                      keyPoints: [],
                      detailedAnalysis: 'Analysis not available',
                      confidence: 0,
                      evaluationHistory: [],
                      threats: [],
                      positionalFactors: []
                    }
                  }
                });
                return true;
              }
            }
            // If move parsing failed, try direct move
            const directMove = aiGame.move(aiMoveResult.move);
            if (directMove) {
              console.log("Analysis before dispatch (direct move):", aiMoveResult.analysis);
              // First dispatch the analysis if we have it
              if (aiMoveResult.analysis) {
                dispatch({
                  type: 'SET_ANALYSIS',
                  payload: aiMoveResult.analysis
                });
              }
              
              // Then make the move
              dispatch({
                type: 'MAKE_AI_MOVE',
                payload: { 
                  move: directMove,
                  analysis: aiMoveResult.analysis || {
                    provider: state.settings.provider,
                    positionType: 'equal',
                    evaluation: 0,
                    equalityPercentage: 50,
                    difficulty: 'intermediate',
                    suggestedMoves: [],
                    keyPoints: [],
                    detailedAnalysis: 'Analysis not available',
                    confidence: 0,
                    evaluationHistory: [],
                    threats: [],
                    positionalFactors: []
                  }
                }
              });
              return true;
            }
          }
        } catch (error) {
          setError(error as AIError);
          return false;
        } finally {
          dispatch({ type: 'SET_THINKING', payload: false });
        }
      }

      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  }, [state, dispatch, aiService, setError]);

  const undoMove = useCallback(() => {
    dispatch({ type: 'UNDO_MOVE' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setAIColor = useCallback((color: 'w' | 'b' | 'random') => {
    dispatch({ type: 'SET_AI_COLOR', payload: color });
  }, []);

  const setDifficulty = useCallback((level: 1 | 2 | 3) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: level });
  }, []);

  const setProvider = useCallback((provider: 'gpt4' | 'claude' | 'gemini') => {
    dispatch({ type: 'SET_PROVIDER', payload: provider });
  }, []);

  const setTimeControl = useCallback((minutes: number) => {
    dispatch({ type: 'SET_TIME_CONTROL', payload: minutes });
  }, []);

  const setIncrement = useCallback((seconds: number) => {
    dispatch({ type: 'SET_INCREMENT', payload: seconds });
  }, []);

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_ANNOTATION', payload: annotation });
  }, [dispatch]);

  const updateAnnotation = useCallback((annotation: Annotation) => {
    dispatch({ type: 'UPDATE_ANNOTATION', payload: annotation });
  }, [dispatch]);

  const deleteAnnotation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ANNOTATION', payload: id });
  }, [dispatch]);

  const value = useMemo(() => ({
    state,
    settings: state.settings,
    dispatch,
    makeMove,
    undoMove,
    resetGame,
    setAIColor,
    setDifficulty,
    setProvider,
    setTimeControl,
    setIncrement,
    error,
    clearError,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation
  }), [
    state,
    makeMove,
    undoMove,
    resetGame,
    setAIColor,
    setDifficulty,
    setProvider,
    setTimeControl,
    setIncrement,
    error,
    clearError,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
} 