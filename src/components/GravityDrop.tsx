/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, I_WORDS, A_WORDS, D_WORDS } from '../constants';

interface FallenWord {
  id: number;
  text: string;
  color: string;
  x: string;
  rotate: number;
  yOffset: number;
}

interface Props {
  onComplete: () => void;
}

export default function GravityDrop({ onComplete }: Props) {
  const [fallenWords, setFallenWords] = useState<FallenWord[]>([]);
  const [showButton, setShowButton] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCharClick = useCallback((char: 'I' | 'A' | 'D') => {
    const wordList = char === 'I' ? I_WORDS : (char === 'A' ? A_WORDS : D_WORDS);
    const color = char === 'I' ? COLORS.teal : (char === 'A' ? COLORS.yellow : COLORS.orange);
    
    const newWords = wordList.map((text, idx) => ({
      id: Date.now() + idx,
      text,
      color,
      x: `${Math.random() * 80 + 10}%`,
      rotate: Math.random() * 20 - 10,
      yOffset: Math.random() * 40 // Random stacking height
    }));

    setFallenWords((prev) => [...prev, ...newWords]);
    setShowButton(true);
  }, []);

  useEffect(() => {
    if (fallenWords.length > 0 && !isClearing) {
      const timer = setTimeout(() => {
        setIsClearing(true);
        setTimeout(() => {
          setFallenWords([]);
          setIsClearing(false);
        }, 1000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fallenWords.length, isClearing]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className="flex gap-16 md:gap-32 z-10">
        {(['I', 'A', 'D'] as const).map((char) => (
          <motion.button
            key={char}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCharClick(char)}
            className="text-7xl md:text-9xl font-bold cursor-pointer transition-colors"
            style={{ color: char === 'I' ? COLORS.teal : (char === 'A' ? COLORS.yellow : COLORS.orange) }}
          >
            {char}
          </motion.button>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {fallenWords.map((word) => (
            <motion.div
              key={word.id}
              initial={{ y: -50, x: word.x, opacity: 0 }}
              animate={{ 
                y: `calc(100vh - ${80 + word.yOffset}px)`, 
                opacity: 1,
                rotate: word.rotate,
                transition: { 
                  duration: 0.8, 
                  ease: "easeIn",
                  opacity: { duration: 0.2 }
                }
              }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              className="absolute text-sm md:text-xl font-medium tracking-wider"
              style={{ color: word.color, left: 0 }}
            >
              {word.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="absolute bottom-24 px-8 py-3 border border-black rounded-full text-sm tracking-[0.2em] font-medium hover:bg-black hover:text-white transition-all z-20"
          >
            MIX & MERGE
          </motion.button>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 w-full flex justify-center opacity-30 text-[10px] tracking-[0.5em] uppercase font-light">
        Tap letters to release words
      </div>
    </div>
  );
}
