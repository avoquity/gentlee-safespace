
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
        // Hide all trees after the animation completes - extended to 2500ms (was 1500ms)
        setTimeout(() => setShowTrees(false), 2500)
      ];
      
      return () => {
        treeTimers.forEach(timer => clearTimeout(timer));
      };
    } else {
      setShowTrees(false);
      setCurrentTreeIndex(-1);
    }
  }, [isActive, prefersReducedMotion, isDevelopment]);
  
  if (!showTrees) return null;
  
  // Updated to use Gentlee's branding sage green color for all trees
  const trees = [
    <TreeDeciduous key="deciduous" size={32} className="text-muted-sage" />,
    <TreePalm key="palm" size={32} className="text-muted-sage" />,
    <TreePine key="pine" size={32} className="text-muted-sage" />
  ];
  
  return (
    <div className="absolute top-[-40px] left-0 right-0 flex justify-center items-end h-12 pointer-events-none">
      <div className="flex gap-4 items-end">
        {trees.map((tree, index) => (
          <AnimatePresence key={index}>
            {index <= currentTreeIndex && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 5 }}
                transition={{
                  duration: index === currentTreeIndex ? 0.2 : 0.01, // Quick appearance for trees that should already be visible
                  exit: { duration: 0.3 }
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
