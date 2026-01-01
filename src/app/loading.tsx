'use client';

import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';
import { ForensicBackground } from '@/components/ui/forensic-background';

export default function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <ForensicBackground variant="scan" className="opacity-20" />
      
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Loader variant="forensic" size="lg" text="Loading CaseVault Pro..." />
        
        <motion.div 
          className="mt-8 text-sm text-gray-500 max-w-md text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Processing file data securely client-side
          <br />
          <span className="text-xs mt-1 inline-block text-forensic-accent">No data is transmitted to any server</span>
        </motion.div>
      </motion.div>
    </div>
  );
} 