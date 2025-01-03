import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis, AIConfig, PositionType, Difficulty, ModelProvider } from '@/src/types/ai';

// const baseURL = "https://api.aimlapi.com/v1";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

console.log("Gemini API key:", process.env.GOOGLE_API_KEY);

interface AnalyzeRequest {
  fen: string;
  provider: ModelProvider;
  config: AIConfig;
}

const PROMPTS = {
  gpt4: {
    system: `You are a chess analysis engine. You must return a valid JSON object with this exact structure, and nothing else - no explanations, no markdown:

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

Remember: Return ONLY the JSON object, no other text or formatting.`,
    format: { type: "json_object" }
  },
  claude: {
    system: `You are a chess analysis engine. Analyze the position and return ONLY a JSON object with this structure:
{
  "evaluation": number between -5 and 5 (positive for white advantage),
  "positionType": "equal" | "white_advantage" | "black_advantage" | "white_winning" | "black_winning",
  "suggestedMoves": [{ "move": "algebraic notation", "explanation": "explanation" }],
  "keyPoints": ["point1", "point2", ...],
  "detailedAnalysis": "detailed analysis"
}`
  },
  gemini: {
    system: `You are a chess analysis engine. Return ONLY a JSON object (no markdown, no text) with this structure:
{
  "evaluation": number between -5 and 5 (positive for white advantage),
  "positionType": "equal" | "white_advantage" | "black_advantage" | "white_winning" | "black_winning",
  "suggestedMoves": [{ "move": "algebraic notation", "explanation": "explanation" }],
  "keyPoints": ["point1", "point2", ...],
  "detailedAnalysis": "detailed analysis"
}`
  }
};

export async function POST(request: Request) {
  try {
    const { fen, provider, config } = (await request.json()) as AnalyzeRequest;
    const { temperature, maxTokens, analysisDepth, considerVariations } = config;

    let response: string;
    const prompt = PROMPTS[provider];

    switch (provider) {
      case 'gpt4': {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: prompt.system },
            {
              role: "user",
              content: `Analyze this chess position in FEN notation: ${fen}. ${
                analysisDepth ? `Consider moves up to ${analysisDepth} moves ahead.` : ''
              } ${
                considerVariations ? 'Include important variations in the analysis.' : 'Focus on the main line only.'
              }`
            }
          ],
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 1000,
          response_format: { type: "json_object" }
        });

        response = completion.choices[0]?.message?.content || "{}";
        break;
      }

      case 'claude': {
        const message = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: maxTokens || 1000,
          messages: [
            {
              role: "user",
              content: `${prompt.system}\n\nAnalyze this chess position in FEN notation: ${fen}. ${
                analysisDepth ? `Consider moves up to ${analysisDepth} moves ahead.` : ''
              } ${
                considerVariations ? 'Include important variations in the analysis.' : 'Focus on the main line only.'
              }`
            }
          ]
        });

        response = message.content[0].type === 'text' 
          ? message.content[0].text 
          : JSON.stringify(message.content[0]);
        break;
      }

      case 'gemini': {
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(
          `${prompt.system}\n\nAnalyze this chess position in FEN notation: ${fen}. ${
            analysisDepth ? `Consider moves up to ${analysisDepth} moves ahead.` : ''
          } ${
            considerVariations ? 'Include important variations in the analysis.' : 'Focus on the main line only.'
          }`
        );
        response = result.response.text();
        break;
      }

      default:
        throw new Error('Invalid provider');
    }

    console.log(`Raw ${provider} response:`, response);

    // Try to parse the response as JSON, stripping any markdown if present
    let analysisData;
    try {
      const cleanResponse = response.replace(/^```json\n|\n```$/g, '').trim();
      console.log("Cleaned response:", cleanResponse);
      analysisData = JSON.parse(cleanResponse);
      console.log("Parsed analysis data:", analysisData);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error('Invalid analysis format');
    }

    // Convert to our internal format
    const analysis: AIAnalysis = {
      provider,
      positionType: analysisData.positionType,
      evaluation: analysisData.evaluation,
      equalityPercentage: calculateEqualityPercentage(analysisData.evaluation),
      difficulty: determineDifficulty(analysisData.evaluation),
      suggestedMoves: analysisData.suggestedMoves,
      keyPoints: analysisData.keyPoints,
      detailedAnalysis: analysisData.detailedAnalysis,
      confidence: 0.8,
      evaluationHistory: [],
      threats: [],
      positionalFactors: []
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze position',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function calculateEqualityPercentage(evaluation: number): number {
  // Convert evaluation to a percentage where 0 is 50% and ±5 is 0%/100%
  const percentage = 50 + (evaluation * 10);
  return Math.max(0, Math.min(100, percentage));
}

function determineDifficulty(evaluation: number): Difficulty {
  if (Math.abs(evaluation) > 3) return 'beginner';
  if (Math.abs(evaluation) > 1) return 'intermediate';
  return 'advanced';
} 