/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import WhatIsIAD from './components/WhatIsIAD';
import SlotMachine from './components/SlotMachine';
import NeverDefined from './components/NeverDefined';
import FinalSlogan from './components/FinalSlogan';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMixButton, setShowMixButton] = useState(false);
  const [isMixing, setIsMixing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMixClick = useCallback(() => {
    if (isMixing || isTransitioning) return;
    
    if (currentPage === 1) {
      setIsTransitioning(true);
      setCurrentPage(2);
      setShowMixButton(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    } else if (currentPage === 2) {
      setIsMixing(true);
      setTimeout(() => {
        setIsMixing(false);
      }, 3500);
    }
  }, [currentPage, isMixing, isTransitioning]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, 4));
    if (currentPage === 2) {
      setShowMixButton(false);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    if (page === 1) {
      setShowMixButton(false);
    } else if (page === 2) {
      setShowMixButton(true);
    }
  }, []);

  const renderPage = (page: number) => {
    switch (page) {
      case 1:
        return <WhatIsIAD onComplete={() => {}} onButtonReady={() => setShowMixButton(true)} isLeaving={isTransitioning} />;
      case 2:
        return <SlotMachine onComplete={nextPage} isMixing={isMixing} onMixComplete={() => setShowMixButton(true)} />;
      case 3:
        return <NeverDefined onComplete={nextPage} />;
      case 4:
        return <FinalSlogan onReset={() => goToPage(1)} />;
      default:
        return null;
    }
  };

  return (
    <motion.div className="fixed inset-0 w-full h-full overflow-hidden bg-white text-[#1F2937] font-sans selection:bg-black selection:text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="absolute inset-0"
          initial={
            currentPage === 2 
              ? { y: '-100%', opacity: 0 } 
              : currentPage === 4 
                ? { opacity: 0 } 
                : { opacity: 0, scale: 0.98 }
          }
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={
            currentPage === 1 
              ? { y: '100%', opacity: 0 } 
              : currentPage === 3 
                ? { opacity: 0 } 
                : { opacity: 0, scale: 1.02 }
          }
          transition={{ 
            duration: currentPage === 3 || currentPage === 4 ? 1.2 : 1.0, 
            ease: [0.23, 1, 0.32, 1] 
          }}
        >
          {renderPage(currentPage)}
        </motion.div>
      </AnimatePresence>

      {currentPage > 1 && currentPage < 4 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          onClick={() => goToPage(currentPage - 1)}
          className="absolute top-6 left-6 text-xs tracking-widest hover:opacity-100 transition-opacity z-50"
        >
          ← BACK
        </motion.button>
      )}

      <motion.button
        key="mix-button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showMixButton ? 1 : 0, y: showMixButton ? 0 : 20 }}
        whileHover={!isMixing && showMixButton ? { scale: 1.03 } : {}}
        whileTap={!isMixing && showMixButton ? { scale: 0.97 } : {}}
        onClick={handleMixClick}
        disabled={isMixing || !showMixButton}
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-12 py-4 rounded-full font-semibold tracking-widest text-sm transition-all ${
          isMixing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : currentPage === 1
            ? 'border border-black hover:bg-black hover:text-white'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {isMixing ? 'MIXING...' : 'MIX & MERGE'}
      </motion.button>
    </motion.div>
  );
}
