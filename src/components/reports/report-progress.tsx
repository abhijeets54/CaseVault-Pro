'use client';

import { motion } from 'framer-motion';
import { Loader2, FileText, Download, CheckCircle } from 'lucide-react';

interface ReportProgressProps {
  stage: 'fetching' | 'generating' | 'saving' | 'complete';
  progress?: number;
  fileName?: string;
}

export function ReportProgress({ stage, progress = 0, fileName }: ReportProgressProps) {
  const stages = [
    { key: 'fetching', label: 'Fetching case data', icon: Loader2 },
    { key: 'generating', label: 'Generating report', icon: FileText },
    { key: 'saving', label: 'Saving metadata', icon: Download },
    { key: 'complete', label: 'Complete', icon: CheckCircle },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg border border-border">
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-secondary to-brand-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Stage indicators */}
        <div className="space-y-3">
          {stages.map((stageItem, index) => {
            const Icon = stageItem.icon;
            const isActive = stageItem.key === stage;
            const isComplete = index < currentStageIndex;

            return (
              <motion.div
                key={stageItem.key}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isComplete
                      ? 'bg-green-500/20 text-green-500'
                      : isActive
                      ? 'bg-brand-secondary/20 text-brand-secondary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`}
                  />
                </div>
                <span
                  className={`text-sm ${
                    isActive || isComplete
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stageItem.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* File name */}
        {fileName && stage === 'complete' && (
          <motion.div
            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              {fileName}
            </p>
          </motion.div>
        )}

        {/* Percentage for generating stage */}
        {stage === 'generating' && progress > 0 && (
          <div className="text-center">
            <motion.p
              className="text-2xl font-bold text-brand-secondary"
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}
