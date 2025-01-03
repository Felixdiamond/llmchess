import React, { useMemo } from 'react';
import { useGame } from '@/src/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const positionTypeColors = {
  equal: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  white_advantage: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  black_advantage: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  white_winning: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/30',
  black_winning: 'bg-purple-600/10 text-purple-600 border-purple-600/30'
} as const;

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/30',
  intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  advanced: 'bg-red-500/10 text-red-500 border-red-500/30'
} as const;

export function Analysis() {
  const { state } = useGame();
  const { analysis } = state;

  const positionTypeColor = useMemo(() => {
    if (!analysis) return '';
    return positionTypeColors[analysis.positionType] || '';
  }, [analysis?.positionType]);

  const difficultyColor = useMemo(() => {
    if (!analysis) return '';
    return difficultyColors[analysis.difficulty] || '';
  }, [analysis?.difficulty]);

  if (!analysis) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-primary/10 animate-pulse" />
          <span>Analyzing position...</span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-6 bg-primary/5 rounded animate-pulse" />
          <div className="h-6 bg-primary/5 rounded animate-pulse w-2/3" />
          <div className="h-6 bg-primary/5 rounded animate-pulse w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className={positionTypeColor}>
                {analysis.positionType.replace('_', ' ')}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current position assessment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className={difficultyColor}>
                {analysis.difficulty}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI difficulty level</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {analysis.equalityPercentage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                  {analysis.equalityPercentage}% equal
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>How balanced the position is</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {analysis.suggestedMoves && analysis.suggestedMoves.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Suggested Moves</h3>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {analysis.suggestedMoves.map((move, i) => (
                <motion.div
                  key={move.move}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-panel-border hover:border-[#4f46e5]/30 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{move.move}</span>
                    <Badge variant="outline" className={i === 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-card'}>
                      {i === 0 ? 'Best' : `#${i + 1}`}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {move.explanation}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {analysis.keyPoints && analysis.keyPoints.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Key Points</h3>
          <ul className="space-y-2">
            <AnimatePresence mode="wait">
              {analysis.keyPoints.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4f46e5] shrink-0" />
                  {point}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      )}

      {analysis.detailedAnalysis && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Detailed Analysis</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {analysis.detailedAnalysis}
          </p>
        </Card>
      )}
    </div>
  );
} 