import { Chess } from 'chess.js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysis {
  position: string;
  evaluation: number;
  suggestions: string[];
  explanation: string;
}

export interface AIMove {
  move: string;
  explanation: string;
}

export type ModelProvider = 'gpt4' | 'claude' | 'gemini' | 'llama';

export class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private currentProvider: ModelProvider;

  constructor(provider: ModelProvider = 'gemini') {
    this.currentProvider = provider;
    this.initializeProviders();
  }

  

  private initializeProviders() {
    // Initialize providers with API keys from environment variables
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY });
    }
    if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string);
    }
  }

  // Method to change the current AI provider
  setProvider(provider: ModelProvider) {
    this.currentProvider = provider;
  }

  // Construct a comprehensive chess context prompt
  private constructChessContext(game: Chess): string {
    const fen = game.fen();
    const moveHistory = game.history();
    
    return `Chess Game Context:
- Current FEN: ${fen}
- Move History: ${moveHistory.join(', ') || 'No moves yet'}
- Current Turn: ${game.turn() === 'w' ? 'White' : 'Black'}
- Possible Moves: ${game.moves().join(', ')}

Analyze the current chess position. Provide:
1. A brief description of the current board state
2. Strategic evaluation of the position
3. Top 3 recommended moves with brief explanations
4. Any immediate tactical opportunities or threats

Format your response as:
Position Description: [description]
Evaluation: [numeric evaluation, 0 is equal, positive favors white, negative favors black]
Recommended Moves:
1. [Move in SAN notation]: [Explanation]
2. [Move in SAN notation]: [Explanation]
3. [Move in SAN notation]: [Explanation]
`;
  }

  async analyzePosition(game: Chess): Promise<AIAnalysis> {
    const prompt = this.constructChessContext(game);

    try {
      let response: string | undefined;

      switch (this.currentProvider) {
        case 'gpt4':
          if (!this.openai) throw new Error('OpenAI not initialized');
          const gptResponse = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300
          });
          response = gptResponse.choices[0]?.message?.content || undefined;
          break;

        case 'claude':
          if (!this.anthropic) throw new Error('Anthropic not initialized');
          const claudeResponse = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }]
          });
          response = claudeResponse.content[0]?.text || undefined;
          break;

        case 'gemini':
          if (!this.gemini) throw new Error('Gemini not initialized');
          const geminiModel = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
          const geminiResult = await geminiModel.generateContent(prompt);
          response = geminiResult.response.text();
          break;

        default:
          throw new Error('Unsupported AI provider');
      }

      // Parse the AI response
      return this.parseAnalysisResponse(response || '');
    } catch (error) {
      console.error('Error analyzing position:', error);
      // Fallback to default analysis if AI fails
      return {
        position: "Analysis unavailable",
        evaluation: 0,
        suggestions: this.getDefaultSuggestions(game),
        explanation: "Unable to generate AI analysis. Using default suggestions."
      };
    }
  }

  async suggestMove(game: Chess): Promise<AIMove> {
    console.log("Suggesting move for:", game.fen());
    const prompt = this.constructChessContext(game) + 
      "\nChoose the BEST single move for the current player and explain your reasoning.";

    try {
      let response: string | undefined;

      switch (this.currentProvider) {
        case 'gpt4':
          if (!this.openai) throw new Error('OpenAI not initialized');
          const gptResponse = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200
          });
          response = gptResponse.choices[0]?.message?.content || undefined;
          break;

        case 'claude':
          if (!this.anthropic) throw new Error('Anthropic not initialized');
          const claudeResponse = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 200,
            messages: [{ role: "user", content: prompt }]
          });
          response = claudeResponse.content[0]?.text || undefined;
          break;

        case 'gemini':
          console.log("Gemini ", this.gemini);
          if (!this.gemini) throw new Error('Gemini not initialized');
          const geminiModel = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
          const geminiResult = await geminiModel.generateContent(prompt);
          response = geminiResult.response.text();
          break;

        default:
          throw new Error('Unsupported AI provider');
      }

      // Parse the AI move suggestion
      return this.parseMoveResponse(game, response || '');
    } catch (error) {
      console.error('Error suggesting move:', error);
      // Fallback to random move if AI fails
      const moves = game.moves({ verbose: true });
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      
      return {
        move: randomMove ? randomMove.san : '',
        explanation: "Fallback: Random move selected due to AI error."
      };
    }
  }

  // Helper method to parse AI analysis response
  private parseAnalysisResponse(response: string): AIAnalysis {
    const defaultAnalysis: AIAnalysis = {
      position: "Unable to parse AI analysis",
      evaluation: 0,
      suggestions: ["Control the center", "Develop pieces", "Ensure king safety"],
      explanation: "Fallback analysis due to parsing error"
    };

    try {
      // Basic parsing logic - this might need refinement
      const positionMatch = response.match(/Position Description:\s*(.+?)(?=\nEvaluation:|\n)/s);
      const evaluationMatch = response.match(/Evaluation:\s*([-+]?\d+\.?\d*)/);
      const suggestionsMatch = response.match(/Recommended Moves:\n(.*)/s);

      return {
        position: positionMatch ? positionMatch[1].trim() : defaultAnalysis.position,
        evaluation: evaluationMatch ? parseFloat(evaluationMatch[1]) : 0,
        suggestions: suggestionsMatch 
          ? suggestionsMatch[1].split('\n')
            .slice(0, 3)
            .map(line => line.split(':')[0].trim())
          : defaultAnalysis.suggestions,
        explanation: response.slice(0, 300) // Truncate for safety
      };
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
      return defaultAnalysis;
    }
  }

  // Helper method to parse AI move suggestion
  private parseMoveResponse(game: Chess, response: string): AIMove {
    try {
      // More comprehensive move extraction
      const moveMatch = response.match(/\b([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)\b/);
      const move = moveMatch ? moveMatch[1] : '';
  
      // Validate the move
      if (move) {
        const validMoves = game.moves();
        if (!validMoves.includes(move)) {
          console.warn(`Suggested move ${move} not in valid moves:`, validMoves);
          throw new Error(`Invalid move: ${move}`);
        }
      }
  
      return {
        move: move,
        explanation: response.slice(0, 200) // Truncate explanation
      };
    } catch (error) {
      console.error('Error parsing AI move:', error);
      // Fallback to random move
      const moves = game.moves();
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      
      return {
        move: randomMove || '',
        explanation: "Fallback: Random move selected due to AI parsing error."
      };
    }
  }

  // Existing helper methods from previous implementation
  private getDefaultSuggestions(game: Chess): string[] {
    const suggestions = [
      "Control the center",
      "Develop your pieces",
      "Protect your king"
    ];

    if (game.history().length < 4) {
      suggestions.push("Focus on controlling e4 and d4");
    }

    if (game.isCheck()) {
      suggestions.unshift("Your king is in check! Find a way to defend.");
    }

    return suggestions;
  }
}

// Export a default instance
export const aiService = new AIService();