
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeDeciduous, TreePalm, TreePine } from 'lucide-react';

interface TreePopProps {
  isActive: boolean;
  prefersReducedMotion: boolean;
}

export const TreePop: React.FC<TreePopProps> = ({ isActive, prefersReducedMotion }) => {
  const [showTrees, setShowTrees] = useState(false);
  const [currentTreeIndex, setCurrentTreeIndex] = useState(-1);
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      if (isDevelopment) {
        console.log("TreePop - Starting tree pop animation sequence");
      }
      
      setShowTrees(true);
      setCurrentTreeIndex(0);
      
      // Animate the trees with proper timing
      const treeTimers = [
        setTimeout(() => setCurrentTreeIndex(0), 0),
        setTimeout(() => setCurrentTreeIndex(1), 250),
        setTimeout(() => setCurrentTreeIndex(2), 500),
        // Extended display time to 10 seconds (10000ms) before hiding
        setTimeout(() => setShowTrees(false), 10000)
      ];
      
      return () => {
        treeTimers.forEach(timer => clearTimeout(timer));
      };
    } else if (!isActive) {
      // Only reset the animation when isActive changes to false
      setShowTrees(false);
      setCurrentTreeIndex(-1);
    }
  }, [isActive, prefersReducedMotion, isDevelopment]);
  
  if (!showTrees) return null;
  
  // Sage green trees with increased size for cartoon-like appearance
  const trees = [
    <TreeDeciduous key="deciduous" size={48} className="text-muted-sage" />,
    <TreePalm key="palm" size={48} className="text-muted-sage" />,
    <TreePine key="pine" size={48} className="text-muted-sage" />
  ];
  
  return (
    <div className="absolute top-[-70px] left-0 right-0 flex justify-center items-end h-16 pointer-events-none">
      <div className="flex gap-4 items-end">
        {trees.map((tree, index) => (
          <AnimatePresence key={index}>
            {index <= currentTreeIndex && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1.2, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 5 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: index === currentTreeIndex ? 0.5 : 0.01,
                  exit: { duration: 0.5 }
                }}
              >
                {tree}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
};
