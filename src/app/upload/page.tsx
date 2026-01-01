'use client';

import { AppShell } from "../../components/app-shell";
import { FileDropzone } from "../../components/file-dropzone";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCases } from "@/lib/hooks/queries/use-cases";
import { useRecordCOCEvent } from "@/lib/hooks/queries/use-chain-of-custody";
import { useIndexFile } from "@/lib/hooks/queries/use-search";
import { processFile } from "@/lib/services/file-processor";
import { extractMetadata } from "@/lib/services/metadata-extractor";
import { Upload } from "lucide-react";

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const router = useRouter();
  const { data: cases = [] } = useCases();
  const recordCOC = useRecordCOCEvent();
  const indexFile = useIndexFile();

  const handleFilesAccepted = async (files: File[]) => {
    if (files.length === 0) return;
    if (!selectedCaseId) {
      alert('Please select a case first');
      return;
    }

    setIsAnalyzing(true);

    try {
      const file = files[0];
      const analysis = await processFile(file);
      const analysisWithMetadata = await extractMetadata(file, analysis);
      const { hash, fileSignatureMatch: signatureMatch } = analysisWithMetadata;

      await recordCOC.mutateAsync({
        caseId: selectedCaseId,
        fileName: file.name,
        fileHash: hash.sha256,
        activityType: 'uploaded',
        metadata: { fileSize: file.size, fileType: file.type },
      });

      await recordCOC.mutateAsync({
        caseId: selectedCaseId,
        fileName: file.name,
        fileHash: hash.sha256,
        activityType: 'analyzed',
        metadata: { signatureMatch, hasMetadata: !!analysisWithMetadata.metadata },
      });

      await indexFile.mutateAsync({
        caseId: selectedCaseId,
        fileHash: hash.sha256,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        metadata: analysisWithMetadata.metadata,
        tags: [],
      });

      alert('File analyzed successfully! Chain of custody recorded.');
      router.push(`/cases`);
    } catch (error) {
      console.error('Error analyzing file:', error);
      alert('An error occurred while analyzing the file. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Upload className="text-brand-secondary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Upload Evidence</h1>
            <p className="text-gray-400">
              Upload files to analyze metadata, generate hashes, and record chain of custody
            </p>
          </div>
        </div>

        <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Case</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full px-4 py-3 bg-brand-darkBg border border-brand-darkBorder rounded-lg text-white focus:border-brand-secondary outline-none"
          >
            <option value="">-- Select a case --</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.caseName}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-brand-darkCard p-8 rounded-lg border border-brand-darkBorder">
          <FileDropzone
            onFilesAccepted={handleFilesAccepted}
            isLoading={isAnalyzing}
            maxFiles={1}
            maxSize={200 * 1024 * 1024}
          />

          <div className="mt-6 text-sm text-gray-400">
            <p className="font-medium mb-2 text-gray-300">Supported file types:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Images (JPG, PNG, GIF, TIFF, WebP)</li>
              <li>Documents (PDF, DOCX, XLSX, PPTX, TXT)</li>
              <li>Media files (MP3, MP4, AVI, MKV)</li>
              <li>And many more...</li>
            </ul>
          </div>

          <div className="mt-6 px-4 py-3 bg-brand-info/10 border border-brand-info/30 text-brand-info rounded-md text-sm">
            <p>
              <strong>Privacy & Chain of Custody:</strong> All file processing occurs locally in
              your browser. Chain of custody events are recorded to Supabase with cryptographic
              signatures.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 