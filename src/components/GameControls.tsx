import { useGame } from "../contexts/GameContext";
import { Button } from "./ui/button";
import { MdOutlineDraw, MdRestartAlt } from "react-icons/md";
import { ImUndo } from "react-icons/im";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIProviderSelector } from "./ui/card-hover-effect";

const providers = [
  { title: "gpt4" },
  { title: "claude" },
  { title: "gemini" }
];

type Provider = (typeof providers)[number]["title"];

interface GameControlsProps {
  onToggleDrawing: () => void;
  isDrawingMode: boolean;
}

export function GameControls({ onToggleDrawing, isDrawingMode }: GameControlsProps) {
  const { state, resetGame, undoMove, setAIColor, setDifficulty, setProvider } = useGame();

  return (
    <>
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Button 
            variant={isDrawingMode ? "default" : "ghost"}
            className="gap-2 text-[#a1a1aa] hover:text-white hover:bg-[#2c2e33]"
            onClick={onToggleDrawing}
          >
            <MdOutlineDraw className="w-5 h-5" />
            <span>Annotate</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={undoMove}
            className="text-[#a1a1aa] hover:text-white hover:bg-[#2c2e33]"
          >
            <ImUndo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetGame}
            className="text-[#a1a1aa] hover:text-white hover:bg-[#2c2e33]"
          >
            <MdRestartAlt className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="controls-content">
        <div className="space-y-4">
          <div>
            <label className="section-title block mb-2">Play as</label>
            <Select 
              defaultValue="random"
              onValueChange={(value: "white" | "black" | "random") => 
                setAIColor(value === "white" ? "b" : value === "black" ? "w" : "random")
              }
            >
              <SelectTrigger className="bg-[#2c2e33] border-none text-[#a1a1aa] h-9">
                <SelectValue placeholder="Choose side" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="section-title block mb-2">Difficulty</label>
            <Select 
              defaultValue="2"
              onValueChange={(value) => setDifficulty(parseInt(value) as 1 | 2 | 3)}
            >
              <SelectTrigger className="bg-[#2c2e33] border-none text-[#a1a1aa] h-9">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="section-title block mb-2">AI Provider</label>
            <AIProviderSelector
              items={providers}
              selectedProvider={state.settings.provider as Provider}
              onSelect={(provider) => setProvider(provider as Provider)}
            />
          </div>
        </div>

        {state.isThinking && (
          <div className="status-indicator justify-center mt-auto">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-[#a1a1aa]">AI is thinking...</span>
          </div>
        )}
      </div>
    </>
  );
}
