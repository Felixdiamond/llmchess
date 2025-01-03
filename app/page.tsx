"use client";

import { useState, useEffect } from "react";
import { Analysis } from "@/src/components/Analysis";
import { GameControls } from "@/src/components/GameControls";
import { ChessboardComponent } from "@/src/components/Chessboard";
import { useGame } from "@/src/contexts/GameContext";
import { MoveHistory } from "@/src/components/MoveHistory";
import { FaChess, FaHistory, FaChartLine, FaClock } from "react-icons/fa";
import { FaGear, FaChessKnight } from "react-icons/fa6";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThinkingState } from "@/src/components/ThinkingState";
import { motion, AnimatePresence } from "framer-motion";
import { GameOver } from "@/src/components/GameOver";
import { Evaluation } from "@/src/components/Evaluation";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { state, resetGame, dispatch } = useGame();
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [highlightSection, setHighlightSection] = useState<string | null>(null);

  useEffect(() => {
    if (highlightSection) {
      const timer = setTimeout(() => {
        setHighlightSection(null);
      }, 2000); // Reset after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [highlightSection]);

  return (
    <div className="app-container">
      {state.gameOver && (
        <GameOver gameOver={state.gameOver} onNewGame={resetGame} />
      )}

      <motion.div
        className="main-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <FaChessKnight className="w-7 h-7 text-[#4f46e5]" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent light:text-black">
                  LLM Chess
                </h1>
              </motion.div>
              <nav className="flex items-center gap-3">
                <motion.button 
                  className="nav-item"
                  onClick={resetGame}
                >
                  <FaChess className="w-4 h-4" />
                  <span>New Game</span>
                </motion.button>
                <motion.button 
                  className="nav-item"
                  onClick={() => setHighlightSection('history')}
                >
                  <FaHistory className="w-4 h-4" />
                  <span>History</span>
                </motion.button>
                <motion.button 
                  className="nav-item"
                  onClick={() => setHighlightSection('analysis')}
                >
                  <FaChartLine className="w-4 h-4" />
                  <span>Analysis</span>
                </motion.button>
              </nav>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <motion.div
                  className="status-indicator"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <FaClock className="w-4 h-4 text-[#4f46e5]" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="player-indicator white"
                        animate={{ scale: state.turn === "w" ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 2, repeat: state.turn === "w" ? Infinity : 0 }}
                      />
                      <span className="time-display">
                        {formatTime(state.timeWhite)}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-white/[0.08]"></div>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="player-indicator black"
                        animate={{ scale: state.turn === "b" ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 2, repeat: state.turn === "b" ? Infinity : 0 }}
                      />
                      <span className="time-display">
                        {formatTime(state.timeBlack)}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="flex items-center gap-3">
                  <ThinkingState isThinking={state.isThinking} />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>
      </motion.div>

      <motion.div
        className="game-layout"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div className="side-column" variants={itemVariants}>
          <motion.div className="controls-container">
            <GameControls 
              onToggleDrawing={() => setIsDrawingMode(!isDrawingMode)}
              isDrawingMode={isDrawingMode}
            />
          </motion.div>
          <motion.div 
            className={`history-container ${highlightSection === 'history' ? 'highlight-pulse' : ''}`}
          >
            <div className="section-header">
              <div className="flex items-center gap-2">
                <FaHistory className="w-4 h-4 text-[#4f46e5]" />
                <h2 className="section-title">Move History</h2>
              </div>
              <motion.div
                className="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {state.history.length} moves
              </motion.div>
            </div>
            <div className="section-content">
              <MoveHistory />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="board-column"
          variants={itemVariants}
        >
          <div className="chess-board-container">
            <motion.div
              className="game-status"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="status-indicator">
                <motion.div
                  className={`player-indicator ${
                    state.turn === "w" ? "white" : "black"
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-[#e2e4e9]">
                  {state.turn === "w" ? "White" : "Black"} to move
                </span>
              </div>
              <AnimatePresence>
                {state.isCheck && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="status-indicator text-red-400"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Check!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="w-full h-full flex items-center justify-center">
              <ChessboardComponent isDrawingMode={isDrawingMode} />
            </div>
          </div>
        </motion.div>

        <motion.div className="side-column" variants={itemVariants}>
          <motion.div 
            className={`analysis-container ${highlightSection === 'analysis' ? 'highlight-pulse' : ''}`}
          >
            <div className="section-header">
              <div className="flex items-center gap-2">
                <FaChartLine className="w-4 h-4 text-[#4f46e5]" />
                <h2 className="section-title">Analysis</h2>
              </div>
              <motion.div
                className="badge success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span>Updated</span>
              </motion.div>
            </div>
            <div className="section-content">
              <Analysis />
            </div>
          </motion.div>
          <motion.div className="evaluation-container">
            <div className="section-header">
              <div className="flex items-center gap-2">
                <FaGear className="w-4 h-4 text-[#4f46e5]" />
                <h2 className="section-title">Evaluation</h2>
              </div>
            </div>
            <div className="section-content">
              <Evaluation />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 flex items-center gap-3 px-5 py-3 bg-destructive/10 backdrop-blur-xl border border-destructive/20 rounded-xl text-sm text-destructive shadow-2xl shadow-destructive/5 z-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{state.error.message}</span>
            <motion.button
              className="ml-2 p-1 hover:bg-destructive/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
