"use client";

import { createContext, useContext, ReactNode } from 'react';
import { FileAnalysis, ReportOptions } from '../types';
import { processFile } from '../services/file-processor';
import { extractMetadata } from '../services/metadata-extractor';
import { generateReport, generateCaseReport as generateCaseReportPdf } from '../services/report-generator';
import { ReportGenerator } from '../services/report-generator-v2';
import { ChainOfCustodyService } from '../services/chain-of-custody';
import { SearchService } from '../services/search';
import { CaseService } from '../services/cases';
import { generateId } from '../utils';
import { useUser } from '@clerk/nextjs';
import { useCases, useCreateCase } from './queries/use-cases';
import { useRecordCOCEvent } from './queries/use-chain-of-custody';
import { useIndexFile } from './queries/use-search';
import { useState } from 'react';

interface ForensicStoreContextType {
  isAnalyzing: boolean;
  error: string | null;
  analyzeFile: (file: File, caseId: string) => Promise<FileAnalysis>;
  generateAnalysisReport: (analysisId: string, options: ReportOptions) => Promise<Blob>;
}

const ForensicStoreContext = createContext<ForensicStoreContextType | undefined>(undefined);

export function ForensicStoreProvider({ children }: { children: ReactNode }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const recordCOC = useRecordCOCEvent();
  const indexFile = useIndexFile();

  const analyzeFile = async (file: File, caseId: string): Promise<FileAnalysis> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { hash, metadata: fileMetadata, signatureMatch } = await processFile(file);
      const extractedMetadata = await extractMetadata(file, fileMetadata.type);

      const analysis: FileAnalysis = {
        id: generateId(),
        timestamp: Date.now(),
        file: fileMetadata,
        hash,
        metadata: extractedMetadata,
        mimeType: fileMetadata.type,
        fileSignatureMatch: signatureMatch,
      };

      await recordCOC.mutateAsync({
        caseId,
        fileName: file.name,
        fileHash: hash.sha256,
        activityType: 'uploaded',
        metadata: { fileSize: file.size, fileType: file.type },
      });

      await recordCOC.mutateAsync({
        caseId,
        fileName: file.name,
        fileHash: hash.sha256,
        activityType: 'analyzed',
        metadata: { hasMetadata: !!extractedMetadata },
      });

      await indexFile.mutateAsync({
        caseId,
        fileHash: hash.sha256,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        metadata: extractedMetadata,
        tags: [],
      });

      setIsAnalyzing(false);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      throw err;
    }
  };

  const generateAnalysisReport = async (analysisId: string, options: ReportOptions): Promise<Blob> => {
    return new Blob();
  };

  return (
    <ForensicStoreContext.Provider
      value={{
        isAnalyzing,
        error,
        analyzeFile,
        generateAnalysisReport,
      }}
    >
      {children}
    </ForensicStoreContext.Provider>
  );
}

export function useForensicStore() {
  const context = useContext(ForensicStoreContext);
  if (context === undefined) {
    throw new Error('useForensicStore must be used within a ForensicStoreProvider');
  }
  return context;
}
