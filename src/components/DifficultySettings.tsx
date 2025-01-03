import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaBrain, FaChess, FaRobot } from 'react-icons/fa';
import { useGame } from '@/src/contexts/GameContext';

interface DifficultyLevel {
  level: 1 | 2 | 3;
  name: string;
  description: string;
  icon: typeof FaBrain;
  color: string;
  features: string[];
}

const difficultyLevels: DifficultyLevel[] = [
  {
    level: 1,
    name: 'Beginner',
    description: 'Perfect for learning chess basics',
    icon: FaChess,
    color: 'text-emerald-500',
    features: [
      'Basic tactical awareness',
      'Simple positional understanding',
      'Focuses on piece safety',
      'Helps avoid basic blunders'
    ]
  },
  {
    level: 2,
    name: 'Intermediate',
    description: 'Challenging but not overwhelming',
    icon: FaBrain,
    color: 'text-blue-500',
    features: [
      'Advanced tactical combinations',
      'Good positional play',
      'Strategic planning',
      'Endgame technique'
    ]
  },
  {
    level: 3,
    name: 'Advanced',
    description: 'Test your skills against a strong opponent',
    icon: FaRobot,
    color: 'text-purple-500',
    features: [
      'Complex tactical patterns',
      'Deep strategic understanding',
      'Long-term planning',
      'Strong endgame technique'
    ]
  }
];

export function DifficultySettings() {
  const { state, setDifficulty } = useGame();
  const currentDifficulty = state.settings.difficulty;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaBrain className="w-5 h-5" />
          Difficulty Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {difficultyLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = currentDifficulty === level.level;

            return (
              <motion.button
                key={level.level}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDifficulty(level.level)}
                className={`
                  relative p-4 rounded-lg border transition-colors
                  ${isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-accent border-border'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full bg-primary/10 ${level.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{level.name}</h3>
                      <Badge 
                        variant={isSelected ? "default" : "outline"}
                        className="ml-2"
                      >
                        Level {level.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {level.description}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {level.features.map((feature, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="selected-difficulty"
                    className="absolute inset-0 border-2 border-primary rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 