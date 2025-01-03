import { Chess } from 'chess.js';
import { GameState, GameSettings, GameAction } from '../types/chess';

export const initialState: GameState = {
  game: new Chess(),
  fen: new Chess().fen(),
  history: [],
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
  isThinking: false,
  moveNumber: 1,
  lastMove: null,
  analysis: null,
  annotations: [],
  gameOver: null,
  timeWhite: 600, // 10 minutes
  timeBlack: 600,
  error: null,
  settings: {
    aiColor: 'random',
    difficulty: 2,
    provider: 'gpt4',
    timeControl: 10,
    increment: 0
  }
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { from, to, newTime } = action.payload;
      const newGame = new Chess(state.game.fen());
      const result = newGame.move({ from, to });
      if (!result) return state;

      return {
        ...state,
        game: newGame,
        fen: newGame.fen(),
        history: newGame.history(),
        isCheck: newGame.isCheck(),
        isCheckmate: newGame.isCheckmate(),
        isDraw: newGame.isDraw(),
        turn: newGame.turn() as 'w' | 'b',
        moveNumber: newGame.moveNumber(),
        lastMove: { from, to },
        timeWhite: state.turn === 'w' ? newTime : state.timeWhite,
        timeBlack: state.turn === 'b' ? newTime : state.timeBlack
      };
    }

    case 'MAKE_AI_MOVE': {
      const { move, analysis } = action.payload;
      const newGame = new Chess(state.game.fen());
      const result = newGame.move(move);
      if (!result) return state;

      const newTime = state.turn === 'w' 
        ? state.timeWhite + state.settings.increment 
        : state.timeBlack + state.settings.increment;

      return {
        ...state,
        game: newGame,
        fen: newGame.fen(),
        history: newGame.history(),
        isCheck: newGame.isCheck(),
        isCheckmate: newGame.isCheckmate(),
        isDraw: newGame.isDraw(),
        turn: newGame.turn() as 'w' | 'b',
        moveNumber: newGame.moveNumber(),
        analysis,
        isThinking: false,
        lastMove: { from: result.from, to: result.to },
        timeWhite: state.turn === 'w' ? newTime : state.timeWhite,
        timeBlack: state.turn === 'b' ? newTime : state.timeBlack
      };
    }

    case 'GAME_OVER': {
      const { reason, winner } = action.payload;
      return {
        ...state,
        gameOver: {
          reason,
          winner
        }
      };
    }

    case 'UPDATE_TIME': {
      const { color, time } = action.payload;
      const newState = {
        ...state,
        timeWhite: color === 'w' ? time : state.timeWhite,
        timeBlack: color === 'b' ? time : state.timeBlack
      };

      // Check for time forfeit
      if (time <= 0) {
        newState.gameOver = {
          reason: 'timeout',
          winner: color === 'w' ? 'b' : 'w'
        };
      }

      return newState;
    }

    case 'SET_TIME_CONTROL': {
      const timeInSeconds = action.payload * 60;
      return {
        ...state,
        settings: {
          ...state.settings,
          timeControl: action.payload
        },
        timeWhite: timeInSeconds,
        timeBlack: timeInSeconds,
        gameOver: null // Reset game over state when changing time control
      };
    }

    case 'SET_ANALYSIS': {
      return {
        ...state,
        analysis: action.payload
      };
    }

    case 'SET_THINKING': {
      return {
        ...state,
        isThinking: action.payload
      };
    }

    case 'UNDO_MOVE': {
      const newGame = new Chess(state.game.fen());
      newGame.undo();
      if (state.settings.aiColor !== 'random') {
        newGame.undo(); // Undo both player and AI moves
      }

      // Remove annotations for the undone moves
      const currentMoveNumber = newGame.moveNumber();
      const remainingAnnotations = state.annotations.filter(
        annotation => annotation.moveIndex < currentMoveNumber
      );

      return {
        ...state,
        game: newGame,
        fen: newGame.fen(),
        history: newGame.history(),
        isCheck: newGame.isCheck(),
        isCheckmate: newGame.isCheckmate(),
        isDraw: newGame.isDraw(),
        turn: newGame.turn() as 'w' | 'b',
        moveNumber: currentMoveNumber,
        analysis: null,
        lastMove: null,
        annotations: remainingAnnotations
      };
    }

    case 'RESET_GAME': {
      return {
        ...initialState,
        settings: state.settings, // Preserve user settings
        annotations: [] // Clear annotations on reset
      };
    }

    case 'SET_AI_COLOR': {
      return {
        ...state,
        settings: {
          ...state.settings,
          aiColor: action.payload
        }
      };
    }

    case 'SET_DIFFICULTY': {
      return {
        ...state,
        settings: {
          ...state.settings,
          difficulty: action.payload
        }
      };
    }

    case 'SET_PROVIDER': {
      return {
        ...state,
        settings: {
          ...state.settings,
          provider: action.payload
        }
      };
    }

    case 'SET_INCREMENT': {
      return {
        ...state,
        settings: {
          ...state.settings,
          increment: action.payload
        }
      };
    }

    case 'NAVIGATE_TO_MOVE': {
      const moveIndex = action.payload;
      const newGame = new Chess();
      
      // Replay moves up to the selected index
      for (let i = 0; i <= moveIndex; i++) {
        const move = state.history[i];
        newGame.move(move);
      }

      return {
        ...state,
        game: newGame,
        fen: newGame.fen(),
        isCheck: newGame.isCheck(),
        isCheckmate: newGame.isCheckmate(),
        isDraw: newGame.isDraw(),
        turn: newGame.turn() as 'w' | 'b',
        moveNumber: newGame.moveNumber(),
        lastMove: moveIndex >= 0 ? {
          from: newGame.history({ verbose: true })[moveIndex].from,
          to: newGame.history({ verbose: true })[moveIndex].to
        } : null
      };
    }

    case 'ADD_ANNOTATION': {
      const newAnnotation = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };

      // Remove any existing annotation for this move
      const existingAnnotations = state.annotations.filter(
        a => a.moveIndex !== action.payload.moveIndex
      );

      return {
        ...state,
        annotations: [...existingAnnotations, newAnnotation]
      };
    }

    case 'UPDATE_ANNOTATION': {
      const updatedAnnotations = state.annotations.map(annotation =>
        annotation.id === action.payload.id ? action.payload : annotation
      );

      return {
        ...state,
        annotations: updatedAnnotations
      };
    }

    case 'DELETE_ANNOTATION': {
      const remainingAnnotations = state.annotations.filter(
        annotation => annotation.id !== action.payload
      );

      return {
        ...state,
        annotations: remainingAnnotations
      };
    }

    default:
      return state;
  }
} 