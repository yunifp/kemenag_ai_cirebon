import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  icon,
  className
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className={cn(
                "w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]",
                className
              )}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="p-2 rounded-xl bg-gray-50 text-gray-700">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    {description && (
                      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors self-start"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export const ModalFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3", className)}>
    {children}
  </div>
);
