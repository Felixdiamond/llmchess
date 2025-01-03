import React, { useCallback } from 'react';
import { useGame } from '@/src/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboard, FaUndo, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MoveAnnotation } from './MoveAnnotation';

interface MoveAnnotation {
  symbol: string;
  description: string;
  color: string;
}

const moveAnnotations: Record<string, MoveAnnotation> = {
  '!': { symbol: '!', description: 'Good move', color: 'text-emerald-500' },
  '!!': { symbol: '!!', description: 'Brilliant move', color: 'text-emerald-600' },
  '?': { symbol: '?', description: 'Mistake', color: 'text-yellow-500' },
  '??': { symbol: '??', description: 'Blunder', color: 'text-red-500' },
  '!?': { symbol: '!?', description: 'Interesting move', color: 'text-blue-500' },
  '?!': { symbol: '?!', description: 'Dubious move', color: 'text-orange-500' },
};

export function MoveHistory() {
  const { state, dispatch, addAnnotation, updateAnnotation, deleteAnnotation } = useGame();

  const copyPGN = useCallback(() => {
    const pgn = state.game.pgn();
    navigator.clipboard.writeText(pgn);
  }, [state.game]);

  const navigateToMove = useCallback((index: number) => {
    dispatch({ type: 'NAVIGATE_TO_MOVE', payload: index });
  }, [dispatch]);

  const undoLastMove = useCallback(() => {
    dispatch({ type: 'UNDO_MOVE' });
  }, [dispatch]);

  // Group moves into pairs (white and black moves)
  const moveGroups = state.history.reduce((groups: string[][], move, i) => {
    const groupIndex = Math.floor(i / 2);
    if (!groups[groupIndex]) {
      groups[groupIndex] = [];
    }
    groups[groupIndex].push(move);
    return groups;
  }, []);

  // Get annotation for a move (this would come from analysis in a real implementation)
  const getMoveAnnotation = (move: string, index: number): MoveAnnotation | null => {
    if (state.analysis?.suggestedMoves.some(m => m.move === move)) {
      return moveAnnotations['!'];
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {state.history.length} moves
          </Badge>
          {state.history.length > 0 && (
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToMove(0)}
                className="p-1.5 rounded-md hover:bg-accent"
                title="First move"
              >
                <FaAngleDoubleLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToMove(state.history.length - 1)}
                className="p-1.5 rounded-md hover:bg-accent"
                title="Last move"
              >
                <FaAngleDoubleRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.history.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={undoLastMove}
                className="p-1.5 rounded-md hover:bg-accent"
                title="Undo last move"
              >
                <FaUndo className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyPGN}
                className="p-1.5 rounded-md hover:bg-accent"
                title="Copy PGN"
              >
                <FaClipboard className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <AnimatePresence>
            {moveGroups.map((moves, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center"
              >
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                  {i + 1}
                </Badge>
                {moves.map((move, j) => {
                  const moveIndex = i * 2 + j;
                  const annotation = state.annotations.find(a => a.moveIndex === moveIndex);
                  const isCurrentMove = moveIndex === state.history.length - 1;

                  return (
                    <div
                      key={j}
                      className="flex items-center gap-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateToMove(moveIndex)}
                        className={`
                          flex-1 flex items-center gap-2 p-2 rounded-lg transition-colors
                          ${isCurrentMove
                            ? 'bg-primary/20 border border-primary/20'
                            : 'hover:bg-accent'
                          }
                        `}
                      >
                        <div className={`w-2 h-2 rounded-full ${j === 0 ? 'bg-white' : 'bg-black'}`} />
                        <span className="font-mono">{move}</span>
                        {isCurrentMove && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto text-xs text-primary"
                          >
                            Current
                          </motion.span>
                        )}
                      </motion.button>

                      <MoveAnnotation
                        moveIndex={moveIndex}
                        annotation={annotation}
                        onSave={addAnnotation}
                        onDelete={deleteAnnotation}
                      />
                    </div>
                  );
                })}
                {moves.length === 1 && <div className="h-full" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
} 