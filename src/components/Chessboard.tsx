import { useCallback, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGame } from '../contexts/GameContext';
import type { Square } from 'chess.js';
import { Chess } from 'chess.js';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { FaCircle, FaSquare, FaLongArrowAltRight, FaEraser, FaCamera, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface SquareStyles {
  [square: string]: {
    background?: string;
    borderRadius?: string;
    backgroundColor?: string;
  };
}

interface DrawableSquare {
  square: Square;
  color: string;
  type: 'circle' | 'square';
}

type Arrow = [Square, Square, string];

type DrawingTool = 'arrow' | 'circle' | 'square' | 'eraser';

const DRAWING_COLORS = [
  { name: 'green', value: 'rgba(34, 197, 94, 0.8)', tooltip: 'Good move' },
  { name: 'red', value: 'rgba(239, 68, 68, 0.8)', tooltip: 'Mistake' },
  { name: 'blue', value: 'rgba(59, 130, 246, 0.8)', tooltip: 'Interesting' },
  { name: 'yellow', value: 'rgba(234, 179, 8, 0.8)', tooltip: 'Alternative' }
];

interface ChessboardProps {
  isDrawingMode: boolean;
}

export function ChessboardComponent({ isDrawingMode }: ChessboardProps) {
  const { state, makeMove } = useGame();
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<SquareStyles>({});
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [shapes, setShapes] = useState<DrawableSquare[]>([]);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('arrow');
  const [selectedColor, setSelectedColor] = useState(DRAWING_COLORS[0].value);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Square | null>(null);
  const [currentArrow, setCurrentArrow] = useState<Arrow | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Get valid moves for a square
  const getMoveOptions = useCallback((square: Square) => {
    if (state.isThinking) return false;
    
    const game = new Chess(state.fen);
    const moves = game.moves({ square, verbose: true });
    
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: SquareStyles = {};
    moves.forEach(move => {
      newSquares[move.to] = {
        background: game.get(move.to) && game.get(move.to).color !== game.get(square).color 
          ? "radial-gradient(circle, rgba(99, 102, 241, 0.2) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(99, 102, 241, 0.2) 25%, transparent 25%)",
        borderRadius: "50%"
      };
    });
    newSquares[square] = {
      background: "rgba(99, 102, 241, 0.3)"
    };
    setOptionSquares(newSquares);
    return true;
  }, [state.isThinking, state.fen]);

  // Handle square clicks for moves
  const onSquareClick = useCallback((square: Square) => {
    if (state.isThinking || isDrawingMode) return;

    // First click - show move options
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // Second click - make the move if valid
    const game = new Chess(state.fen);
    const moves = game.moves({ square: moveFrom, verbose: true });
    const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

    if (!foundMove) {
      // If clicked on a different piece that has moves, show its options instead
      const hasMoveOptions = getMoveOptions(square);
      setMoveFrom(hasMoveOptions ? square : null);
      return;
    }

    // Make the move
    void makeMove(moveFrom, square);
    setMoveFrom(null);
    setOptionSquares({});
  }, [moveFrom, state.fen, state.isThinking, isDrawingMode, getMoveOptions, makeMove]);

  // Handle drawing mode interactions
  const handleDrawing = useCallback((square: Square) => {
    if (!isDrawingMode || state.isThinking) return;
    
    if (selectedTool === 'eraser') {
      // Erase any arrows that start or end at this square
      setArrows(prev => prev.filter(a => a[0] !== square && a[1] !== square));
      // Erase any shapes on this square
      setShapes(prev => prev.filter(s => s.square !== square));
      return;
    }

    if (selectedTool !== 'arrow') {
      setShapes(prev => [
        ...prev.filter(s => s.square !== square),
        { square, color: selectedColor, type: selectedTool as 'circle' | 'square' }
      ]);
      return;
    }

    // Arrow drawing logic
    if (!isDrawing) {
      // Start drawing arrow
      setIsDrawing(true);
      setDrawStart(square);
      setCurrentArrow(null);
    } else {
      // Finish drawing arrow
      if (drawStart && square !== drawStart) {
        setArrows(prev => [...prev, [drawStart, square, selectedColor]]);
      }
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentArrow(null);
    }
  }, [isDrawingMode, state.isThinking, selectedTool, selectedColor, isDrawing, drawStart]);

  const onMouseEnter = useCallback((square: Square) => {
    if (!isDrawingMode) return;

    if (isDrawing && drawStart && selectedTool === 'arrow' && square !== drawStart) {
      setCurrentArrow([drawStart, square, selectedColor]);
    } else if (selectedTool === 'eraser') {
      // Erase any arrows that pass through this square
      setArrows(prev => prev.filter(arrow => {
        const [start, end] = arrow;
        return !(start === square || end === square);
      }));
      // Erase any shapes on this square
      setShapes(prev => prev.filter(s => s.square !== square));
    }
  }, [isDrawing, drawStart, isDrawingMode, selectedTool, selectedColor]);

  const onMouseUp = useCallback(() => {
    // Only handle mouse up for non-arrow tools or eraser
    if (selectedTool !== 'arrow') {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentArrow(null);
    }
  }, [selectedTool]);

  const onMouseLeave = useCallback(() => {
    // Only cancel drawing if using non-arrow tools or eraser
    if (selectedTool !== 'arrow') {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentArrow(null);
    }
  }, [selectedTool]);

  // Clear all drawings
  const clearDrawings = useCallback(() => {
    setArrows([]);
    setShapes([]);
  }, []);

  // Take a screenshot of the board
  const takeScreenshot = useCallback(async () => {
    if (!boardRef.current) return;
    
    try {
      // Create a wrapper div with proper styling
      const wrapper = document.createElement('div');
      wrapper.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--board-background');
      wrapper.style.padding = '20px';
      wrapper.style.borderRadius = '8px';
      
      // Clone the board and ensure proper styling
      const boardClone = boardRef.current.cloneNode(true) as HTMLElement;
      
      // Add any active arrows or shapes to the clone
      const boardComponent = boardClone.querySelector('.board-container');
      if (boardComponent) {
        boardComponent.classList.add('screenshot');
      }
      
      wrapper.appendChild(boardClone);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--board-background'),
        scale: 2,
        logging: false,
        width: boardRef.current.offsetWidth + 40,
        height: boardRef.current.offsetHeight + 40,
      });

      document.body.removeChild(wrapper);
      
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chess-position-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }, []);

  // Combine all square styles
  const customSquareStyles = {
    ...optionSquares,
    ...(state.lastMove ? {
      [state.lastMove.from]: { backgroundColor: 'rgba(99, 102, 241, 0.2)' },
      [state.lastMove.to]: { backgroundColor: 'rgba(99, 102, 241, 0.2)' }
    } : {}),
    ...shapes.reduce<SquareStyles>((acc, { square, color, type }) => ({
      ...acc,
      [square]: {
        background: type === 'circle' 
          ? `radial-gradient(circle at center, ${color} 0%, ${color} 70%, transparent 70%)`
          : undefined,
        backgroundColor: type === 'square' ? color : undefined
      }
    }), {})
  };

  return (
    <div className="relative w-full h-full">
      {isDrawingMode && (
        <TooltipProvider>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 z-10 flex flex-col gap-3 bg-background/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-border"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground/80">Drawing Tools</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                onClick={clearDrawings}
              >
                <FaTimes className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={selectedTool === 'arrow' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTool('arrow')}
                    className="h-8 w-8 transition-all"
                  >
                    <FaLongArrowAltRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Draw Arrow</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={selectedTool === 'circle' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTool('circle')}
                    className="h-8 w-8 transition-all"
                  >
                    <FaCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Draw Circle</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={selectedTool === 'square' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTool('square')}
                    className="h-8 w-8 transition-all"
                  >
                    <FaSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Draw Square</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={selectedTool === 'eraser' ? 'default' : 'ghost'}
                    onClick={() => setSelectedTool('eraser')}
                    className="h-8 w-8 transition-all"
                  >
                    <FaEraser className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Erase Drawing</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {DRAWING_COLORS.map(color => (
                <Tooltip key={color.name} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={selectedColor === color.value ? 'default' : 'ghost'}
                      onClick={() => setSelectedColor(color.value)}
                      className={`h-8 w-8 transition-all ${
                        selectedColor === color.value 
                          ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' 
                          : ''
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color.value }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{color.tooltip}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={takeScreenshot}
              className="w-full gap-2 mt-1"
            >
              <FaCamera className="w-4 h-4" />
              <span>Save Screenshot</span>
            </Button>
          </motion.div>
        </TooltipProvider>
      )}

      <div 
        className="relative w-full h-full board-container" 
        ref={boardRef}
        onContextMenu={e => e.preventDefault()}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ backgroundColor: 'var(--board-background)' }}
      >
        <Chessboard 
          id="mainBoard"
          position={state.fen}
          onSquareClick={isDrawingMode ? handleDrawing : onSquareClick}
          onSquareRightClick={handleDrawing}
          onMouseOverSquare={onMouseEnter}
          boardOrientation={state.settings.aiColor === 'w' ? 'black' : 'white'}
          customDarkSquareStyle={{ 
            backgroundColor: 'var(--board-dark)',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)'
          }}
          customLightSquareStyle={{ 
            backgroundColor: 'var(--board-light)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
          customSquareStyles={customSquareStyles}
          customArrows={currentArrow ? [...arrows, currentArrow] : arrows}
          arePiecesDraggable={false}
          animationDuration={200}
        />
      </div>
    </div>
  );
} 