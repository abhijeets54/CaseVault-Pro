'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateReportSchema, GenerateReportFormData } from '@/lib/validation/schemas';
import { FileText, Download } from 'lucide-react';

interface ReportGeneratorFormProps {
  onSubmit: (data: { format: 'pdf' | 'json' | 'csv'; includeCOC: boolean }) => void;
  isGenerating?: boolean;
}

export function ReportGeneratorForm({
  onSubmit,
  isGenerating = false,
}: ReportGeneratorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ format: 'pdf' | 'json' | 'csv'; includeCOC: boolean }>({
    defaultValues: {
      format: 'pdf',
      includeCOC: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-brand-secondary" size={24} />
          <h2 className="text-xl font-bold text-white">Generate Report</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="relative flex items-center justify-center p-4 border border-brand-darkBorder rounded-lg cursor-pointer hover:border-brand-secondary transition">
                <input
                  type="radio"
                  value="pdf"
                  {...register('format')}
                  className="sr-only peer"
                />
                <div className="text-center peer-checked:text-brand-secondary">
                  <FileText size={24} className="mx-auto mb-1" />
                  <span className="text-sm font-medium">PDF</span>
                </div>
              </label>

              <label className="relative flex items-center justify-center p-4 border border-brand-darkBorder rounded-lg cursor-pointer hover:border-brand-secondary transition">
                <input
                  type="radio"
                  value="json"
                  {...register('format')}
                  className="sr-only peer"
                />
                <div className="text-center text-gray-400 peer-checked:text-brand-secondary">
                  <FileText size={24} className="mx-auto mb-1" />
                  <span className="text-sm font-medium">JSON</span>
                </div>
              </label>

              <label className="relative flex items-center justify-center p-4 border border-brand-darkBorder rounded-lg cursor-pointer hover:border-brand-secondary transition">
                <input
                  type="radio"
                  value="csv"
                  {...register('format')}
                  className="sr-only peer"
                />
                <div className="text-center text-gray-400 peer-checked:text-brand-secondary">
                  <FileText size={24} className="mx-auto mb-1" />
                  <span className="text-sm font-medium">CSV</span>
                </div>
              </label>
            </div>
            {errors.format && (
              <p className="text-sm text-brand-danger mt-1">{errors.format.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-brand-darkBg rounded-lg">
            <input
              type="checkbox"
              id="includeCOC"
              {...register('includeCOC')}
              className="w-5 h-5 rounded border-brand-darkBorder bg-brand-darkCard text-brand-secondary focus:ring-2 focus:ring-brand-secondary"
            />
            <label htmlFor="includeCOC" className="text-sm text-gray-300 cursor-pointer">
              Include Chain of Custody events in report
            </label>
          </div>

          <div className="bg-brand-info/10 border border-brand-info/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong className="text-brand-info">Note:</strong> The report will include all files
              in this case with their metadata, hashes, and tags.
              {' '}Chain of custody events add a complete audit trail to the report.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary text-white rounded-lg font-semibold hover:bg-brand-secondary/90 disabled:opacity-50 transition"
      >
        <Download size={20} />
        {isGenerating ? 'Generating...' : 'Generate Report'}
      </button>
    </form>
  );
}
