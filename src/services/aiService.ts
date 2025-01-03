import { Chess } from 'chess.js';
import { AIMove, AIAnalysis, ModelProvider, DifficultyConfig, SuggestedMove, PositionType, Difficulty } from '@/src/types/ai';

interface GameSettings {
  provider: ModelProvider;
  difficulty: 1 | 2 | 3;
}

const ANALYSIS_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;

const difficultySettings: Record<number, DifficultyConfig> = {
  1: { // Beginner
    temperature: 0.9,
    maxDepth: 2,
    evaluationThreshold: 1.5,
    preferSimpleMoves: true,
    avoidComplexPositions: true,
    systemPrompt: `You are a beginner-friendly chess coach. Focus on:
- Basic piece safety and development
- Simple tactical opportunities
- Clear and educational explanations
- Avoiding overly complex positions
- Teaching basic chess principles`,
    analysisDepth: 2,
    considerVariations: false,
    confidence: 0.7
  },
  2: { // Intermediate
    temperature: 0.7,
    maxDepth: 4,
    evaluationThreshold: 1.0,
    preferSimpleMoves: false,
    avoidComplexPositions: false,
    systemPrompt: `You are an intermediate chess coach. Focus on:
- Tactical combinations and patterns
- Positional understanding
- Strategic planning
- Basic endgame principles
- Balanced decision making`,
    analysisDepth: 4,
    considerVariations: true,
    confidence: 0.8
  },
  3: { // Advanced
    temperature: 0.5,
    maxDepth: 6,
    evaluationThreshold: 0.5,
    preferSimpleMoves: false,
    avoidComplexPositions: false,
    systemPrompt: `You are an advanced chess coach. Focus on:
- Complex tactical patterns
- Deep positional understanding
- Long-term strategic planning
- Advanced endgame technique
- Finding the most precise moves`,
    analysisDepth: 6,
    considerVariations: true,
    confidence: 0.9
  }
};

export class AIService {
  private abortController: AbortController | null = null;
  private analysisCache = new Map<string, { analysis: AIAnalysis; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async getAnalysis(fen: string, settings: GameSettings, retryCount = 0): Promise<AIAnalysis> {
    // Check cache first
    const cached = this.analysisCache.get(fen);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.analysis;
    }

    // Cancel any pending requests
    this.abortController?.abort();
    this.abortController = new AbortController();

    const difficultyConfig = difficultySettings[settings.difficulty];
    
    try {
      const game = new Chess(fen);
      const response = await Promise.race([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fen,
            provider: settings.provider,
            config: {
              temperature: difficultyConfig.temperature,
              maxTokens: 1000,
              systemPrompt: settings.provider === 'gpt4' 
                ? `You are a chess analysis engine. Analyze the position and return a JSON object containing your analysis. The response must be valid JSON with this exact structure:
{
  "evaluation": number between -5 and 5 (positive for white advantage),
  "positionType": "equal" | "white_advantage" | "black_advantage" | "white_winning" | "black_winning",
  "suggestedMoves": [
    {
      "move": "algebraic notation",
      "explanation": "explanation of the move"
    }
  ],
  "keyPoints": ["point1", "point2", ...],
  "detailedAnalysis": "detailed text analysis"
}`
                : `You are a chess analysis engine. Analyze the position and provide your response as a JSON object with exactly this structure:

{
  "evaluation": number,        // between -5 and 5, positive for white advantage
  "positionType": string,     // one of: "equal", "white_advantage", "black_advantage", "white_winning", "black_winning"
  "suggestedMoves": [         // array of move objects
    {
      "move": string,         // the move in algebraic notation
      "explanation": string   // explanation of the move
    }
  ],
  "keyPoints": string[],      // array of key points about the position
  "detailedAnalysis": string  // detailed positional and strategic analysis
}

Return ONLY the JSON object, no other text or formatting.`,
              analysisDepth: difficultyConfig.analysisDepth,
              considerVariations: difficultyConfig.considerVariations
            }
          }),
          signal: this.abortController.signal
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis request timed out')), ANALYSIS_TIMEOUT)
        )
      ]) as Response;

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Analysis failed: ${error.message}`);
      }

      const rawAnalysis = await response.json();
      console.log("Raw response from AI:", rawAnalysis);
      
      let analysisData;
      try {
        // Strip markdown code blocks if present
        const text = rawAnalysis.text.replace(/^```json\n|\n```$/g, '');
        console.log("Stripped text:", text);
        
        // Try to parse the text as JSON
        analysisData = JSON.parse(text);
        console.log("Parsed analysis data:", analysisData);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
        throw new Error('Invalid analysis format');
      }

      const analysis: AIAnalysis = {
        provider: settings.provider,
        positionType: analysisData.positionType,
        evaluation: analysisData.evaluation,
        equalityPercentage: this.calculateEqualityPercentage(analysisData.evaluation),
        difficulty: this.determineDifficulty(analysisData.evaluation, game),
        suggestedMoves: analysisData.suggestedMoves.map((move: { move: string; explanation: string }) => ({
          ...move,
          evaluation: 0,
          confidence: difficultySettings[settings.difficulty].confidence,
          isCapture: move.move.includes('x'),
          isTactical: move.explanation?.toLowerCase().includes('tactic') || 
                     move.explanation?.toLowerCase().includes('threat')
        })),
        keyPoints: analysisData.keyPoints,
        detailedAnalysis: analysisData.detailedAnalysis,
        confidence: difficultySettings[settings.difficulty].confidence,
        evaluationHistory: [{
          ply: game.moveNumber() * 2 - (game.turn() === 'w' ? 1 : 0),
          evaluation: analysisData.evaluation,
          bestMove: analysisData.suggestedMoves[0]?.move
        }],
        threats: this.analyzeThreats(game),
        positionalFactors: this.analyzePosition(game)
      };
      console.log("Final analysis object:", analysis);
      
      // Cache the result
      this.analysisCache.set(fen, { analysis, timestamp: Date.now() });
      
      return analysis;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Analysis request was cancelled');
      }

      if (retryCount < MAX_RETRIES) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.getAnalysis(fen, settings, retryCount + 1);
      }

      throw error;
    }
  }

  private evaluateMove(move: SuggestedMove, game: Chess, difficulty: number): number {
    const config = difficultySettings[difficulty];
    let score = move.evaluation || 0;

    // Add randomness based on difficulty
    const randomFactor = (Math.random() - 0.5) * config.temperature;
    score += randomFactor;

    // Adjust score based on difficulty preferences
    if (config.preferSimpleMoves) {
      // Prefer simple moves at lower levels
      if (move.isCapture) score += 0.2;
      if (move.isTactical) score += 0.1;
    }

    if (config.avoidComplexPositions) {
      // Penalize moves that lead to complex positions
      const testGame = new Chess(game.fen());
      testGame.move(move.move);
      const possibleResponses = testGame.moves({ verbose: true });
      
      // More possible responses = more complex position
      score -= (possibleResponses.length / 40) * 0.3;

      // Penalize moves with many variations
      if (move.variations) {
        score -= (move.variations.length / 5) * 0.2;
      }
    }

    return score;
  }

  async getMove(game: Chess, settings: GameSettings): Promise<{ move: string; analysis?: AIAnalysis }> {
    try {
      // Get move first
      const moveResponse = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: game.fen(),
          provider: settings.provider
        })
      });

      if (!moveResponse.ok) {
        throw new Error('Failed to get move');
      }

      const moveResult = await moveResponse.json();

      // Get analysis in parallel
      try {
        const analysis = await this.getAnalysis(game.fen(), settings);
        return { move: moveResult.move, analysis };
      } catch (error) {
        console.error('Analysis error:', error);
        // Return move even if analysis fails
        return { move: moveResult.move };
      }
    } catch (error) {
      console.error('Error getting AI move:', error);
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  private determinePositionType(evaluation: number): PositionType {
    if (evaluation > 3) return 'white_winning';
    if (evaluation < -3) return 'black_winning';
    if (evaluation > 1) return 'white_advantage';
    if (evaluation < -1) return 'black_advantage';
    return 'equal';
  }

  private calculateEqualityPercentage(evaluation: number): number {
    // Convert evaluation to a percentage where 0 is 50% and ±5 is 0%/100%
    const percentage = 50 + (evaluation * 10);
    return Math.max(0, Math.min(100, percentage));
  }

  private determineDifficulty(evaluation: number, game: Chess): Difficulty {
    const moveCount = game.moveNumber();
    const piecesLeft = game.board().flat().filter(Boolean).length;
    
    // Early game is usually easier
    if (moveCount < 10) return 'beginner';
    
    // Endgame with clear advantage
    if (piecesLeft < 10 && Math.abs(evaluation) > 2) return 'intermediate';
    
    // Complex middlegame or unclear positions
    if (Math.abs(evaluation) < 0.5) return 'advanced';
    
    return 'intermediate';
  }

  private analyzeThreats(game: Chess): { side: 'white' | 'black'; description: string; moves: string[]; }[] {
    const threats: { side: 'white' | 'black'; description: string; moves: string[]; }[] = [];
    const moves = game.moves({ verbose: true });

    // Check for immediate captures
    const captures = moves.filter(m => m.flags.includes('c'));
    if (captures.length > 0) {
      threats.push({
        side: game.turn() === 'w' ? 'white' : 'black',
        description: 'Immediate capture available',
        moves: captures.map(m => m.san)
      });
    }

    // Check for checks
    const checks = moves.filter(m => m.flags.includes('c'));
    if (checks.length > 0) {
      threats.push({
        side: game.turn() === 'w' ? 'white' : 'black',
        description: 'Check available',
        moves: checks.map(m => m.san)
      });
    }

    return threats;
  }

  private analyzePosition(game: Chess): { category: string; evaluation: number; description: string; }[] {
    const factors: { category: string; evaluation: number; description: string; }[] = [];
    const board = game.board();

    // Analyze center control
    const centerControl = this.evaluateCenterControl(board);
    factors.push({
      category: 'Center Control',
      evaluation: centerControl,
      description: centerControl > 0 ? 'White controls more central squares' : 'Black controls more central squares'
    });

    // Analyze piece development
    const development = this.evaluateDevelopment(board);
    factors.push({
      category: 'Development',
      evaluation: development,
      description: development > 0 ? 'White has better piece development' : 'Black has better piece development'
    });

    // Analyze pawn structure
    const pawnStructure = this.evaluatePawnStructure(board);
    factors.push({
      category: 'Pawn Structure',
      evaluation: pawnStructure,
      description: this.describePawnStructure(pawnStructure)
    });

    return factors;
  }

  private evaluateCenterControl(board: (import('chess.js').Piece | null)[][]): number {
    // Simple center control evaluation
    const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
    let control = 0;
    
    centerSquares.forEach(([row, col]) => {
      const piece = board[row][col];
      if (piece) {
        control += piece.color === 'w' ? 1 : -1;
      }
    });
    
    return control;
  }

  private evaluateDevelopment(board: (import('chess.js').Piece | null)[][]): number {
    let development = 0;
    
    // Count developed pieces (not on their starting squares)
    for (let col = 0; col < 8; col++) {
      // White minor pieces developed
      if (board[6][col]?.type === 'p') development -= 0.1;
      if (board[7][col]?.type === 'n' || board[7][col]?.type === 'b') development -= 0.5;
      
      // Black minor pieces developed
      if (board[1][col]?.type === 'p') development += 0.1;
      if (board[0][col]?.type === 'n' || board[0][col]?.type === 'b') development += 0.5;
    }
    
    return development;
  }

  private evaluatePawnStructure(board: (import('chess.js').Piece | null)[][]): number {
    let evaluation = 0;
    
    // Check for doubled pawns
    for (let col = 0; col < 8; col++) {
      let whitePawns = 0;
      let blackPawns = 0;
      for (let row = 0; row < 8; row++) {
        if (board[row][col]?.type === 'p') {
          if (board[row][col]?.color === 'w') whitePawns++;
          else blackPawns++;
        }
      }
      if (whitePawns > 1) evaluation -= 0.3;
      if (blackPawns > 1) evaluation += 0.3;
    }
    
    return evaluation;
  }

  private describePawnStructure(evaluation: number): string {
    if (evaluation > 0.5) return 'White has a healthier pawn structure';
    if (evaluation < -0.5) return 'Black has a healthier pawn structure';
    return 'Balanced pawn structure';
  }

  // Clean up method to be called when component unmounts
  cleanup() {
    this.abortController?.abort();
    this.analysisCache.clear();
  }
}