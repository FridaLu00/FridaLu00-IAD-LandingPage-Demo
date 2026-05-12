/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BUBBLE_WORDS } from '../constants';

interface Bubble {
  id: number;
  en: string;
  zh: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface Props {
  onComplete: () => void;
}

export default function NeverDefined({ onComplete }: Props) {
  const [isTriggered, setIsTriggered] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const handleTrigger = useCallback(() => {
    if (isTriggered) return;
    setIsTriggered(true);

    const newBubbles = Array.from({ length: 25 }).map((_, i) => {
      const word = BUBBLE_WORDS[i % BUBBLE_WORDS.length];
      return {
        id: i,
        en: word.en,
        zh: word.zh,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: Math.random() * 0.4 + 0.7,
        delay: Math.random() * 2,
      };
    });
    setBubbles(newBubbles);

    // Auto transition to page 5
    setTimeout(() => {
      onComplete();
    }, 6000);
  }, [isTriggered, onComplete]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center bg-white cursor-pointer overflow-hidden relative"
      onClick={handleTrigger}
    >
      <motion.div
        animate={isTriggered ? { scale: 0.8, opacity: 0.3 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl md:text-6xl font-light tracking-[0.2em] text-center z-10"
      >
        IAD is never defined
      </motion.div>

      <AnimatePresence>
        {isTriggered && bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0.5], 
              scale: bubble.size,
              y: [0, -40, -20],
              transition: {
                duration: 4,
                delay: bubble.delay,
                repeat: Infinity,
                repeatType: 'reverse'
              }
            }}
            className="absolute flex flex-col items-center pointer-events-none text-gray-700"
            style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
          >
            <span className="text-2xl md:text-4xl font-bold whitespace-nowrap opacity-100">{bubble.en}</span>
            <span className="text-sm md:text-base font-medium tracking-widest opacity-80">{bubble.zh}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {!isTriggered && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 uppercase text-xs tracking-[0.3em] opacity-40 font-medium"
        >
          Click to reveal possibilities
        </motion.div>
      )}
    </div>
  );
}
