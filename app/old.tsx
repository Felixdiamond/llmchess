"use client";

import { Analysis } from "@/src/components/Analysis";
import { GameControls } from "@/src/components/GameControls";
import { ChessboardComponent } from "@/src/components/Chessboard";
import { useGame } from "@/src/contexts/GameContext";
import { MoveHistory } from "@/src/components/MoveHistory";
import { FaChess } from "react-icons/fa";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function Home() {
  const { state } = useGame();

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1b1e] overflow-hidden box-border">
      <div className="p-2">
        <header
          className="px-6 py-3 bg-[#25262b]/80 backdrop-blur-lg border-b border-[#2c2e33] shadow-2xl rounded-xl"
        >
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center max-w-fit">
                  <FaChess className="text-4xl text-white mr-3" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                    LLM Chess
                  </h1>
                </div>
                <div className="hidden sm:block h-8 w-px bg-[#2c2e33]"></div>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-[#a1a1aa]">Game</span>
                  <span className="font-mono text-[#e4e4e7] bg-[#2c2e33] px-2 py-1 rounded">
                    #{Math.floor(Math.random() * 1000000)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="hidden md:flex items-center gap-4 px-5 py-3 bg-[#2c2e33] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white shadow-glow-white"></div>
                  <span className="font-mono text-[#e4e4e7]">
                    {formatTime(state.timeWhite)}
                  </span>
                </div>
                <div className="h-4 w-px bg-[#404040]"></div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-black border border-[#404040]"></div>
                  <span className="font-mono text-[#e4e4e7]">
                    {formatTime(state.timeBlack)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-4 py-2 bg-[#2c2e33] rounded-xl"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      state.isThinking ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  ></div>
                  <span className="text-sm text-[#a1a1aa]">
                    {state.isThinking ? "Thinking..." : "Ready"}
                  </span>
                </div>
                <button
                  className="p-2.5 bg-[#2c2e33] rounded-xl hover:bg-[#353535] transition-colors group"
                >
                  <svg
                    className="w-5 h-5 text-[#a1a1aa] group-hover:text-indigo-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main className="px-2 min-w-full flex items-center justify-center border border-red-500 h-screen overflow-hidden">
        <div
          className="flex flex-col w-[25%] border border-red-500"
        >
          <div className="bg-[#25262b] rounded-xl border border-[#2c2e33] shadow-2xl">
              <GameControls />
          </div>
          <div className="bg-[#25262b] rounded-xl border border-[#2c2e33] shadow-2xl">
          </div>
        </div>

        <div
          className="flex items-center justify-center bg-[#25262b] rounded-xl border border-[#2c2e33] shadow-2xl w-[50%]"
        >
          <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 bg-[#2c2e33] rounded-xl"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  state.turn === "w"
                    ? "bg-white shadow-glow-white"
                    : "bg-black border border-[#404040]"
                }`}
              ></div>
              <span className="text-sm text-[#a1a1aa]">
                {state.turn === "w" ? "White" : "Black"} to move
              </span>
            </div>
            {state.isCheck && (
              <div
                className="flex items-center gap-2 px-4 py-2 bg-[#2c2e33] rounded-xl text-red-400"
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
                <span className="text-sm font-semibold">Check!</span>
              </div>
            )}
          </div>

          <button
            className="absolute top-6 right-6 p-2.5 bg-[#2c2e33] rounded-xl hover:bg-[#353535] transition-colors group"
          >
            <svg
              className="w-5 h-5 text-[#a1a1aa] group-hover:text-indigo-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          <div className="w-[500px] h-[500px]">
            <ChessboardComponent />
          </div>

          <div
            className="md:hidden absolute bottom-6 left-6 right-6"
          >
            <div className="flex items-center justify-center gap-6 px-5 py-3 bg-[#2c2e33] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-white shadow-glow-white"></div>
                <span className="font-mono text-[#e4e4e7]">
                  {formatTime(state.timeWhite)}
                </span>
              </div>
              <div className="h-4 w-px bg-[#404040]"></div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-black border border-[#404040]"></div>
                <span className="font-mono text-[#e4e4e7]">
                  {formatTime(state.timeBlack)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col w-[25%]"
        >
          <div className="flex-1 bg-[#25262b] rounded-xl border border-[#2c2e33] shadow-2xl overflow-hidden">
            <div className="p-5 h-full">
              <Analysis />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
