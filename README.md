# LLM Chess

A  chess interface powered by AI language models. Play against GPT-4 or Gemini, with real-time analysis and insights into the AI's thought process.

![LLM Chess Screenshot](screenshot.png)

## Features

- 🎮 Play chess against GPT-4 or Gemini
- 🧠 Real-time position analysis and evaluation
- 💭 Insight into the AI's thought process and strategy
- 🎨 Beautiful, responsive UI with light/dark mode
- ⚡ Built with Next.js 14 and TypeScript

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/llmchess.git
   cd llmchess
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your API keys to the `.env` file:
   - Get an OpenAI API key from [OpenAI](https://platform.openai.com)
   - Get a Google API key from [Google AI Studio](https://makersuite.google.com)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Known Issues

The project is currently in development, and I haven't been able to fully test the AI integration due to API limitations. If you encounter any issues:

- Open an issue on GitHub
- Email me at diamondfelix006@gmail.com

## Tech Stack

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [chess.js](https://github.com/jhlywa/chess.js)
- [OpenAI API](https://platform.openai.com)
- [Google AI API](https://ai.google.dev/)

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
