/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { COLORS, I_WORDS, A_WORDS, D_WORDS } from '../constants';

interface Props {
  onComplete: () => void;
}

export default function MixAndMerge({ onComplete }: Props) {
  const [combination, setCombination] = useState({
    i: I_WORDS[0],
    a: A_WORDS[0],
    d: D_WORDS[0]
  });
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = useCallback(() => {
    setIsSpinning(true);
    
    // Simulate spin duration
    setTimeout(() => {
      setCombination({
        i: I_WORDS[Math.floor(Math.random() * I_WORDS.length)],
        a: A_WORDS[Math.floor(Math.random() * A_WORDS.length)],
        d: D_WORDS[Math.floor(Math.random() * D_WORDS.length)],
      });
      setIsSpinning(false);
    }, 600);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white relative overflow-hidden">
      <div className="flex-1 flex w-full">
        <Column label="I" word={combination.i} color={COLORS.teal} isSpinning={isSpinning} />
        <div className="w-[1px] bg-gray-100" />
        <Column label="A" word={combination.a} color={COLORS.yellow} isSpinning={isSpinning} />
        <div className="w-[1px] bg-gray-100" />
        <Column label="D" word={combination.d} color={COLORS.orange} isSpinning={isSpinning} />
      </div>

      <div className="h-48 flex items-center justify-center border-t border-gray-100 bg-white z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spin}
          className="px-12 py-4 bg-black text-white rounded-full text-sm tracking-[0.3em] font-medium transition-transform"
        >
          MIX & MERGE
        </motion.button>
      </div>

      <motion.button
        whileHover={{ x: 5 }}
        onClick={onComplete}
        className="absolute bottom-8 right-8 p-4 rounded-full border border-gray-200 hover:border-black transition-colors"
      >
        <ChevronRight size={24} />
      </motion.button>
    </div>
  );
}

function Column({ label, word, color, isSpinning }: { label: string; word: string; color: string; isSpinning: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-12 text-sm tracking-[0.5em] text-gray-300 font-bold">
        {label}
      </div>
      
      <div className="h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={word}
            initial={isSpinning ? { y: 100, opacity: 0 } : { y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              staggerChildren: 0.1
            }}
            className="text-2xl md:text-4xl font-semibold tracking-wider text-center"
            style={{ color }}
          >
            {word}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
