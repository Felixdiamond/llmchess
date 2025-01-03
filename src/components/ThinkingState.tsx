import { motion, AnimatePresence } from "framer-motion";
import { FaBrain } from "react-icons/fa";

interface ThinkingStateProps {
  isThinking: boolean;
}

export function ThinkingState({ isThinking }: ThinkingStateProps) {
  return (
    <div className="status-indicator">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <FaBrain className="w-4 h-4 text-[#4f46e5]" />
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-1.5 bg-[#4f46e5] blur-md rounded-full -z-10"
        />
      </motion.div>

      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isThinking ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="thinking-indicator active"
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#e2e4e9]"
              >
                Thinking...
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="thinking-indicator ready"
              />
              <motion.span className="text-sm text-[#e2e4e9]">
                Ready
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 