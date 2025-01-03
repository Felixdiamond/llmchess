import React from 'react';
import { useGame } from '@/src/contexts/GameContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaChartBar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Evaluation() {
  const { state } = useGame();
  const { analysis } = state;

  if (!analysis) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-primary/10 animate-pulse" />
          <span>Calculating evaluation...</span>
        </div>
        <div className="mt-4 flex items-center justify-center h-32">
          <div className="w-8 bg-primary/5 rounded-lg h-full relative overflow-hidden animate-pulse" />
        </div>
      </Card>
    );
  }

  const evaluationColor = analysis.evaluation > 0 
    ? 'text-emerald-500' 
    : analysis.evaluation < 0 
      ? 'text-purple-500' 
      : 'text-blue-500';

  const barColor = analysis.evaluation > 0 
    ? 'bg-emerald-500' 
    : analysis.evaluation < 0 
      ? 'bg-purple-500' 
      : 'bg-blue-500';

  const barHeight = Math.min(100, Math.abs(analysis.evaluation) * 20); // Scale evaluation to percentage
  const isPositive = analysis.evaluation >= 0;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FaChartBar className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Position Score</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Numerical evaluation of the position</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                variant="outline" 
                className={`${evaluationColor.replace('text-', 'bg-')}/10 ${evaluationColor} border-${evaluationColor.replace('text-', '')}/30`}
              >
                {analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation.toFixed(2)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {analysis.evaluation > 0 
                  ? 'White is better by ' 
                  : analysis.evaluation < 0 
                    ? 'Black is better by '
                    : 'Equal position '}
                {Math.abs(analysis.evaluation).toFixed(2)}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center justify-center h-32">
        <div className="w-8 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg h-full relative overflow-hidden border border-panel-border">
          <motion.div
            className={`absolute w-full ${isPositive ? 'bottom-1/2' : 'top-1/2'} ${barColor}/20`}
            initial={{ height: 0 }}
            animate={{ height: `${barHeight}%` }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className={`absolute inset-0 ${barColor}`}
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="absolute top-1/2 w-full border-t border-panel-border" />
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-purple-500">Black</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Negative values favor Black</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-blue-500">Equal</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Values near 0 indicate an equal position</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-emerald-500">White</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Positive values favor White</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
} 