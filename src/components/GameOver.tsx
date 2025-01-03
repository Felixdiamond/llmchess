import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { FaTrophy, FaClock, FaHandshake, FaChessKing } from 'react-icons/fa';
import { GameState } from '@/src/types/chess';

interface GameOverProps {
  gameOver: NonNullable<GameState['gameOver']>;
  onNewGame: () => void;
}

type GameOverReason = NonNullable<GameState['gameOver']>['reason'];

const reasonIcons = {
  checkmate: FaChessKing,
  stalemate: FaHandshake,
  timeout: FaClock,
  draw: FaHandshake,
  insufficient: FaHandshake,
  threefold: FaHandshake,
  default: FaTrophy
} as const;

const reasonMessages = {
  checkmate: (winner: string) => `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins!`,
  stalemate: () => 'Stalemate! The game is a draw.',
  timeout: (winner: string) => `Time's up! ${winner === 'w' ? 'White' : 'Black'} wins on time.`,
  draw: () => 'The game is a draw by agreement.',
  insufficient: () => 'Draw by insufficient material.',
  threefold: () => 'Draw by threefold repetition.',
  default: (winner: string) => `Game Over! ${winner === 'w' ? 'White' : 'Black'} wins!`
} as const;

export function GameOver({ gameOver, onNewGame }: GameOverProps) {
  const Icon = reasonIcons[gameOver.reason as keyof typeof reasonIcons] || reasonIcons.default;
  const messageHandler = reasonMessages[gameOver.reason as keyof typeof reasonMessages] || reasonMessages.default;
  const message = typeof messageHandler === 'function' 
    ? messageHandler(gameOver.winner || 'w')
    : messageHandler;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-card border rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold">{message}</h2>
              
              <p className="text-muted-foreground">
                Would you like to start a new game?
              </p>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={onNewGame}
                  className="w-full"
                >
                  Review Game
                </Button>
                <Button
                  onClick={onNewGame}
                  className="w-full"
                >
                  New Game
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 