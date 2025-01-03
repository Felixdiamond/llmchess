import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGame } from '../contexts/GameContext';
import { AIService } from '../services/ai/aiService';
import { GameControls } from './GameControls';
import { Analysis } from './Analysis';
import { MoveHistory } from './MoveHistory';

export function ChessGame() {
  const { state, dispatch } = useGame();
  const [isThinking, setIsThinking] = useState(false);
  const aiService = new AIService();

  const handleMove = async (from: string, to: string) => {
    if (isThinking) return false;

    const result = dispatch({ type: 'MAKE_MOVE', payload: { from, to } });
    if (!result) return false;

    if (state.settings.aiColor === state.turn) {
      setIsThinking(true);
      try {
        const aiMove = await aiService.suggestMove(state.game);
        if (aiMove.move) {
          dispatch({ type: 'MAKE_AI_MOVE', payload: aiMove });
        }
      } finally {
        setIsThinking(false);
      }
    }

    return true;
  };

  return (
    <div className="chess-grid">
      <MoveHistory moves={state.history} />
      <div className="dashboard-card">
        <Chessboard 
          position={state.fen}
          onPieceDrop={handleMove}
          boardWidth={600}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        />
        <GameControls 
          isThinking={isThinking}
          onUndo={() => dispatch({ type: 'UNDO_MOVE' })}
          onReset={() => dispatch({ type: 'RESET_GAME' })}
        />
      </div>
      <Analysis />
    </div>
  );
} 