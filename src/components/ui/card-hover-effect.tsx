import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SiClaude, SiGooglegemini, SiOpenai } from "react-icons/si";
import { useState } from "react";

const iconMap = {
  "gpt4": SiOpenai,
  "claude": SiClaude,
  "gemini": SiGooglegemini,
} as const;

export const AIProviderSelector = ({
  items,
  className,
  onSelect,
  selectedProvider,
}: {
  items: {
    title: string;
  }[];
  className?: string;
  onSelect: (provider: string) => void;
  selectedProvider: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item) => {
        const IconComponent = iconMap[item.title.toLowerCase() as keyof typeof iconMap];
        
        return (
          <button
            onClick={() => onSelect(item.title.toLowerCase())}
            key={item.title}
            className="relative group block p-2 h-full w-full"
          >
            <AnimatePresence>
              {selectedProvider === item.title.toLowerCase() && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-black/40 block rounded-3xl"
                  layoutId="selectedBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <Card>
              <div className="flex flex-col items-center justify-center space-y-4">
                <IconComponent className="w-12 h-12 text-zinc-100 group-hover:text-zinc-50 transition-colors" />
                <span className="text-zinc-300 font-medium text-sm group-hover:text-zinc-50 transition-colors">
                  {item.title}
                </span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden bg-[#1a1b1e] border border-zinc-800/50 group-hover:border-zinc-700/50 group-hover:bg-[#1e1f23] transition-all duration-300 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="flex items-center justify-center capitalize">
          {children}
        </div>
      </div>
    </div>
  );
};