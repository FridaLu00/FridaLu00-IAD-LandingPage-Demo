/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Matter from 'matter-js';
import { COLORS, I_WORDS, A_WORDS, D_WORDS } from '../constants';

interface PhysicsWord {
  id: number;
  text: string;
  color: string;
  size: number;
  x: number;
  y: number;
  angle: number;
  shadowColor: string;
}

interface Props {
  onComplete: () => void;
  onButtonReady?: () => void;
  isLeaving?: boolean;
}

export default function WhatIsIAD({ onComplete, onButtonReady, isLeaving: externalIsLeaving }: Props) {
  const [isTriggered, setIsTriggered] = useState(false);
  const [physicsWords, setPhysicsWords] = useState<PhysicsWord[]>([]);
  const [clickedLetters, setClickedLetters] = useState<Set<'I' | 'A' | 'D'>>(new Set());
  const [showButton, setShowButton] = useState(false);
  const isLeaving = externalIsLeaving || false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const wordsRef = useRef<PhysicsWord[]>([]);

  useEffect(() => {
    if (!isTriggered || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    engineRef.current = Matter.Engine.create({
      gravity: { x: 0, y: 1.5 },
    });
    engineRef.current.world.gravity.scale = 0.001;

    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + 20,
      width + 100,
      40,
      { isStatic: true }
    );
    const leftWall = Matter.Bodies.rectangle(-20, height / 2, 40, height + 100, {
      isStatic: true,
    });
    const rightWall = Matter.Bodies.rectangle(
      width + 20,
      height / 2,
      40,
      height + 100,
      { isStatic: true }
    );

    Matter.Composite.add(engineRef.current.world, [ground, leftWall, rightWall]);

    renderRef.current = Matter.Render.create({
      canvas,
      engine: engineRef.current,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
      },
    });

    Matter.Render.run(renderRef.current);
    runnerRef.current = Matter.Runner.create();
    Matter.Runner.run(runnerRef.current, engineRef.current);

    return () => {
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, [isTriggered]);

  useEffect(() => {
    const updatePositions = () => {
      if (!engineRef.current || !wordsRef.current.length) return;

      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      const wordBodies = bodies.filter((body) => body.label.startsWith('word_'));

      const updatedWords: PhysicsWord[] = wordBodies.map((body) => {
        const match = body.label.match(/word_(\d+)/);
        const wordId = match ? parseInt(match[1]) : 0;
        const wordData = wordsRef.current.find((w) => w.id === wordId);

        return {
          ...wordData,
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
        } as PhysicsWord;
      });

      setPhysicsWords(updatedWords);
    };

    const interval = setInterval(updatePositions, 16);
    return () => clearInterval(interval);
  }, []);

  const handleInitialClick = useCallback(() => {
    if (isTriggered) return;
    setIsTriggered(true);
  }, [isTriggered]);

  const handleCharClick = useCallback((char: 'I' | 'A' | 'D') => {
    if (!isTriggered || clickedLetters.has(char) || !engineRef.current) return;

    const wordList = char === 'I' ? I_WORDS : char === 'A' ? A_WORDS : D_WORDS;
    const color = char === 'I' ? COLORS.teal : char === 'A' ? COLORS.yellow : COLORS.orange;

    const shadowColors: Record<string, string> = {
      [COLORS.teal]: '#0d4a47',
      [COLORS.yellow]: '#b8860b',
      [COLORS.orange]: '#b4402a',
    };

    const newWords: PhysicsWord[] = wordList.map((text, idx) => {
      const maxSize = 56;
      const minSize = 18;
      const lengthFactor = (12 - text.length) / 12;
      const baseSize = minSize + (maxSize - minSize) * lengthFactor;
      const size = baseSize + (Math.random() - 0.5) * 8;
      const clampedSize = Math.max(minSize, Math.min(maxSize, size));
      
      return {
        id: Date.now() + idx,
        text,
        color,
        size: clampedSize,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 200,
        angle: 0,
        shadowColor: shadowColors[color],
      };
    });

    newWords.forEach((word, idx) => {
      setTimeout(() => {
        if (!engineRef.current) return;
        
        wordsRef.current = [...wordsRef.current, word];
        
        const body = Matter.Bodies.rectangle(
          word.x,
          word.y,
          word.size * word.text.length * 0.6,
          word.size * 1.5,
          {
            restitution: 0.15,
            friction: 0.85,
            frictionAir: 0.005,
            mass: word.size / 30,
            label: `word_${word.id}`,
            render: {
              fillStyle: 'transparent',
              strokeStyle: 'transparent',
            },
          }
        );
        Matter.Composite.add(engineRef.current!.world, body);
      }, idx * 150 + Math.random() * 200);
    });

    const newClickedLetters = new Set([...clickedLetters, char]);
    setClickedLetters(newClickedLetters);

    if (newClickedLetters.size === 3) {
      setTimeout(() => {
        setShowButton(true);
        onButtonReady?.();
      }, 2500);
    }
  }, [isTriggered, clickedLetters, onButtonReady]);

  const text = 'What is IAD?';

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none bg-white overflow-hidden relative"
      onClick={!isTriggered ? handleInitialClick : undefined}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ opacity: isTriggered ? 1 : 0 }}
      />

      {!isTriggered ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl md:text-6xl font-light tracking-widest z-10"
        >
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        <div className="flex gap-16 md:gap-32 z-20">
          {(['I', 'A', 'D'] as const).map((char) => (
            <motion.button
              key={char}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: clickedLetters.has(char) ? 0.5 : 1,
                y: isLeaving ? '150vh' : 0,
              }}
              exit={{ y: '150vh', opacity: 0 }}
              whileHover={{ scale: clickedLetters.has(char) ? 1 : 1.05 }}
              whileTap={{ scale: clickedLetters.has(char) ? 1 : 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCharClick(char);
              }}
              className={`text-7xl md:text-9xl font-bold cursor-pointer transition-colors ${
                clickedLetters.has(char) ? 'cursor-default' : ''
              }`}
              style={{
                color: char === 'I' ? COLORS.teal : char === 'A' ? COLORS.yellow : COLORS.orange,
                pointerEvents: clickedLetters.has(char) ? 'none' : 'auto',
              }}
              transition={{
                duration: isLeaving ? 1.8 : 1.0,
                ease: isLeaving ? [0.23, 1, 0.32, 1] : [0.23, 1, 0.32, 1],
              }}
            >
              {char}
            </motion.button>
          ))}
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-5">
        <AnimatePresence>
          {physicsWords.map((word) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, scale: 0, y: -20 }}
              animate={{
                opacity: isLeaving ? 0 : 1,
                scale: isLeaving ? 0.9 : 1,
                x: word.x,
                y: isLeaving ? word.y + window.innerHeight + 200 : word.y,
                rotate: (word.angle * 180) / Math.PI,
              }}
              exit={{ y: '150vh', opacity: 0 }}
              transition={{
                duration: isLeaving ? 1.8 : 0.5,
                ease: isLeaving ? [0.23, 1, 0.32, 1] : [0.23, 1, 0.32, 1],
              }}
              className="absolute whitespace-nowrap font-bold"
              style={{
                color: word.color,
                fontSize: `${word.size}px`,
                transformOrigin: 'center center',
                left: 0,
                top: 0,
                marginLeft: `-${word.size * word.text.length * 0.3}px`,
                marginTop: `-${word.size * 0.75}px`,
                fontWeight: '600',
              }}
            >
              {word.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      

      {!isTriggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 uppercase text-xs tracking-[0.3em] opacity-40 font-medium z-10"
        >
          Click anywhere to start
        </motion.div>
      )}

      {isTriggered && !showButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute bottom-12 w-full flex justify-center text-[10px] tracking-[0.5em] uppercase font-light z-10"
        >
          Tap letters to release words ({clickedLetters.size}/3)
        </motion.div>
      )}
    </div>
  );
}
