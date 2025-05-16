
import React from 'react';
import { motion } from 'framer-motion';

interface ModalOverlayProps {
  onClick: () => void;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ onClick }) => {
  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0.0, 0.2, 1] }}
      onClick={onClick}
      aria-label="Close modal overlay"
    />
  );
};
