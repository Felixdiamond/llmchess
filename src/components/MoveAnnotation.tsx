import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaChess, FaEdit, FaTrash } from 'react-icons/fa';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export interface Annotation {
  id: string;
  moveIndex: number;
  symbol: string;
  comment: string;
  color: string;
  createdAt: Date;
}

interface MoveAnnotationProps {
  annotation?: Annotation;
  onSave: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  moveIndex: number;
}

const annotationSymbols = [
  { symbol: '!', description: 'Good move', color: 'text-emerald-500' },
  { symbol: '!!', description: 'Brilliant move', color: 'text-emerald-600' },
  { symbol: '?', description: 'Mistake', color: 'text-yellow-500' },
  { symbol: '??', description: 'Blunder', color: 'text-red-500' },
  { symbol: '!?', description: 'Interesting move', color: 'text-blue-500' },
  { symbol: '?!', description: 'Dubious move', color: 'text-orange-500' },
];

export function MoveAnnotation({ annotation, onSave, onDelete, moveIndex }: MoveAnnotationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(annotation?.symbol || '');
  const [comment, setComment] = useState(annotation?.comment || '');

  const handleSave = () => {
    if (!selectedSymbol) return;
    
    const symbolData = annotationSymbols.find(s => s.symbol === selectedSymbol);
    if (!symbolData) return;

    onSave({
      moveIndex,
      symbol: selectedSymbol,
      comment,
      color: symbolData.color
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (annotation?.id && onDelete) {
      onDelete(annotation.id);
    }
  };

  return (
    <>
      {annotation ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <Badge 
                  variant="outline" 
                  className={`${annotation.color} cursor-pointer transition-colors hover:bg-accent/50`}
                  onClick={() => setIsEditing(true)}
                >
                  {annotation.symbol}
                </Badge>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute hidden group-hover:flex -top-1 -right-1 gap-1 z-[100]"
                >
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <FaEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </motion.div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[100]">
              {annotation.comment || 'Click to edit'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <FaEdit className="w-3 h-3" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[100]">
              Add annotation
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FaChess className="w-5 h-5" />
              Move Annotation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {annotationSymbols.map(({ symbol, description, color }) => (
                <motion.button
                  key={symbol}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`
                    p-3 rounded-lg border transition-all relative
                    ${selectedSymbol === symbol 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : 'hover:bg-accent border-border'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Badge variant="outline" className={`${color} text-base px-2`}>
                      {symbol}
                    </Badge>
                    <span className="text-xs text-muted-foreground text-center">
                      {description}
                    </span>
                  </div>
                  {selectedSymbol === symbol && (
                    <motion.div
                      layoutId="selected-annotation"
                      className="absolute inset-0 border-2 border-primary rounded-lg"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-24 px-3 py-2 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="Add your analysis..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className={`
                  px-4 py-2 rounded-lg transition-colors
                  ${selectedSymbol
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                  }
                `}
                disabled={!selectedSymbol}
              >
                Save
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 