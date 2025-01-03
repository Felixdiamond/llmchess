import { Chess } from 'chess.js';
import { GameState, GameSettings, MoveResult } from '../types/chess';

export class GameService {
  private game: Chess;
  private settings: GameSettings;
  private timer: NodeJS.Timeout | null = null;
  private state: GameState;
  
  constructor(settings: GameSettings) {
    this.game = new Chess();
    this.settings = settings;
    this.state = this.getGameState();
  }

  public makeMove(from: string, to: string, promotion?: string): MoveResult | null {
    try {
      const move = this.game.move({ from, to, promotion: promotion || 'q' });
      if (!move) return null;

      return {
        move: move.san,
        fen: this.game.fen(),
        isCapture: move.flags.includes('c'),
        isCheck: this.game.isCheck(),
        isCheckmate: this.game.isCheckmate(),
        isDraw: this.game.isDraw()
      };
    } catch (error) {
      console.error('Move error:', error);
      return null;
    }
  }

  public getGameState(): GameState {
    return {
      fen: this.game.fen(),
      history: this.game.history(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isDraw: this.game.isDraw(),
      turn: this.game.turn() as 'w' | 'b',
      moveNumber: this.game.moveNumber(),
      timeWhite: 0, // Implement time tracking
      timeBlack: 0
    };
  }

  public reset(): void {
    this.game.reset();
    this.stopTimer();
  }

  public startTimer(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      if (this.game.turn() === 'w') {
        this.state.timeWhite -= 1;
      } else {
        this.state.timeBlack -= 1;
      }

      if (this.state.timeWhite <= 0 || this.state.timeBlack <= 0) {
        clearInterval(this.timer!);
        this.timer = null;
        // Handle time out
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
} 