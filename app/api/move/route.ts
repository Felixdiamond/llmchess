import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelProvider } from '@/src/types/ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface MoveRequest {
  fen: string;
  provider: ModelProvider;
}

const PROMPTS: Record<ModelProvider, { system: string }> = {
  gpt4: {
    system: `You are a chess engine. Given a position in FEN notation, suggest the best move. Return ONLY a JSON object with this structure:
{
  "move": string,  // The move in algebraic notation (e.g., "e4", "Nf6")
  "explanation": string  // Brief explanation of the move
}`
  },
  claude: {
    system: `You are a chess engine. Given a position in FEN notation, suggest the best move. Return ONLY a JSON object with this structure:
{
  "move": string,  // The move in algebraic notation (e.g., "e4", "Nf6")
  "explanation": string  // Brief explanation of the move
}`
  },
  gemini: {
    system: `You are a chess engine. Given a position in FEN notation, suggest the best move. Return ONLY a JSON object (no markdown) with this structure:
{
  "move": string,  // The move in algebraic notation (e.g., "e4", "Nf6")
  "explanation": string  // Brief explanation of the move
}`
  }
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fen, provider } = data as MoveRequest;
    const prompt = PROMPTS[provider];
    let response: string;

    switch (provider) {
      case 'gpt4': {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: `Suggest the best move for this chess position in FEN notation: ${fen}` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        response = completion.choices[0]?.message?.content || "{}";
        break;
      }

      case 'claude': {
        const message = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `${prompt.system}\n\nSuggest the best move for this chess position in FEN notation: ${fen}`
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
          `${prompt.system}\n\nSuggest the best move for this chess position in FEN notation: ${fen}`
        );
        response = result.response.text();
        break;
      }

      default:
        throw new Error('Invalid provider');
    }

    console.log(`Raw ${provider} move response:`, response);

    // Parse the response
    let moveData;
    try {
      const cleanResponse = response.replace(/^```json\n|\n```$/g, '').trim();
      console.log("Cleaned move response:", cleanResponse);
      moveData = JSON.parse(cleanResponse);
      console.log("Parsed move data:", moveData);
    } catch (e) {
      console.error("Failed to parse move response as JSON:", e);
      throw new Error('Invalid move format');
    }

    return NextResponse.json(moveData);
  } catch (error) {
    console.error('Move error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get move',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 