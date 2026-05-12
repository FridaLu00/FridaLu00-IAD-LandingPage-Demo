/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, I_WORDS, A_WORDS, D_WORDS } from '../constants';

interface Props {
  onComplete: () => void;
  isMixing?: boolean;
  onMixComplete?: () => void;
}

interface SlotColumn {
  words: string[];
  color: string;
  displayIndex: number;
  isSpinning: boolean;
  finalIndex: number;
}

const wordLists = [I_WORDS, A_WORDS, D_WORDS];

export default function SlotMachine({ onComplete, isMixing: externalIsMixing, onMixComplete }: Props) {
  const isPlaying = externalIsMixing || false;
  const [columns, setColumns] = useState<SlotColumn[]>([
    { words: I_WORDS, color: COLORS.teal, displayIndex: 0, isSpinning: false, finalIndex: 0 },
    { words: A_WORDS, color: COLORS.yellow, displayIndex: 0, isSpinning: false, finalIndex: 0 },
    { words: D_WORDS, color: COLORS.orange, displayIndex: 0, isSpinning: false, finalIndex: 0 },
  ]);
  
  const [hasPlayed, setHasPlayed] = useState(false);
  const intervalsRef = useRef<(NodeJS.Timeout | null)[]>([null, null, null]);

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      handleSpin();
    }
  }, [isPlaying]);

  const spinColumn = (columnIndex: number) => {
    const words = wordLists[columnIndex];
    const finalIndex = Math.floor(Math.random() * words.length);
    
    setColumns((prev) =>
      prev.map((col, idx) =>
        idx === columnIndex
          ? { ...col, isSpinning: true, finalIndex }
          : col
      )
    );

    const interval = setInterval(() => {
      setColumns((prev) =>
        prev.map((col, idx) =>
          idx === columnIndex
            ? { ...col, displayIndex: (col.displayIndex + 1) % col.words.length }
            : col
        )
      );
    }, 50);
    
    intervalsRef.current[columnIndex] = interval;

    const delay = columnIndex * 500;
    setTimeout(() => {
      if (intervalsRef.current[columnIndex]) {
        clearInterval(intervalsRef.current[columnIndex]!);
        intervalsRef.current[columnIndex] = null;
      }
      setColumns((prev) =>
        prev.map((col, idx) =>
          idx === columnIndex
            ? { ...col, isSpinning: false, displayIndex: finalIndex }
            : col
        )
      );
    }, 2000 + delay);
  };

  const handleSpin = () => {
    setHasPlayed(false);
    
    intervalsRef.current.forEach((interval, idx) => {
      if (interval) {
        clearInterval(interval);
        intervalsRef.current[idx] = null;
      }
    });
    
    spinColumn(0);
    setTimeout(() => spinColumn(1), 100);
    setTimeout(() => spinColumn(2), 200);
    
    setTimeout(() => {
      setHasPlayed(true);
      onMixComplete?.();
    }, 3500);
  };

  const getVisibleWords = (column: SlotColumn) => {
    const words = [];
    const total = column.words.length;
    
    for (let i = -3; i <= 3; i++) {
      const adjustedIndex = ((column.displayIndex + i) % total + total) % total;
      const distance = Math.abs(i);
      words.push({
        word: column.words[adjustedIndex],
        distance,
        isCenter: i === 0,
      });
    }
    
    return words;
  };

  const getWordStyle = (column: SlotColumn, distance: number, isCenter: boolean) => {
    const baseSize = 14;
    const centerSize = 32;
    const size = centerSize - distance * 4;
    const opacity = Math.max(0.25, 1 - distance * 0.15);
    
    return {
      color: column.color,
      fontSize: `${Math.max(10, size)}px`,
      fontWeight: isCenter ? '800' : '500',
      opacity,
    };
  };

  return (
    <motion.div 
      className="w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden relative"
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.0, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex gap-4 md:gap-12">
        {columns.map((column, columnIndex) => {
          const visibleWords = getVisibleWords(column);
          
          return (
            <div
              key={columnIndex}
              className="relative w-48 md:w-64 h-80 md:h-96 flex flex-col items-center justify-center"
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
              
              <div className="absolute inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-8 w-full">
                <div className="w-full h-px bg-gray-200" />
              </div>
              <div className="absolute inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-8 w-full">
                <div className="w-full h-px bg-gray-200" />
              </div>
              
              <div className="relative flex flex-col items-center">
                {visibleWords.map(({ word, distance, isCenter }, idx) => (
                  <motion.div
                    key={`${columnIndex}-${word}-${idx}`}
                    animate={{
                      opacity: getWordStyle(column, distance, isCenter).opacity,
                      scale: isCenter ? 1.1 : 1 - distance * 0.08,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="h-14 md:h-16 flex items-center justify-center text-center px-4"
                    style={getWordStyle(column, distance, isCenter)}
                  >
                    {word}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hasPlayed && !isPlaying && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="absolute bottom-12 px-8 py-3 text-sm tracking-widest text-gray-500 hover:text-black transition-colors"
          >
            CONTINUE →
          </motion.button>
        )}
      </AnimatePresence>

      <div className="absolute top-8 text-center">
        <motion.div
          className="text-xs tracking-[0.3em] text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        >
          {hasPlayed ? 'Click CONTINUE to proceed' : 'Press button to mix words'}
        </motion.div>
      </div>
    </motion.div>
  );
}
