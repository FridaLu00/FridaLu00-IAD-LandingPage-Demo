/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface Props {
  onReset: () => void;
}

export default function FinalSlogan({ onReset }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl md:text-7xl font-bold tracking-[0.1em] text-center mb-16"
      >
        Everything is possible
      </motion.h1>

      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '#'} // Placeholder link
        className="px-12 py-4 border-2 border-black rounded-full text-lg tracking-[0.3em] font-bold hover:bg-black hover:text-white transition-all shadow-lg hover:shadow-2xl mb-8"
      >
        START YOUR CREATE
      </motion.button>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        whileHover={{ opacity: 1 }}
        onClick={onReset}
        className="text-xs tracking-[0.2em] font-medium uppercase underline underline-offset-4"
      >
        Back to start
      </motion.button>
    </div>
  );
}
