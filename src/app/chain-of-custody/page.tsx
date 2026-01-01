'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { useCases } from '@/lib/hooks/queries/use-cases';
import { useCaseChain, useVerifyChainIntegrity } from '@/lib/hooks/queries/use-chain-of-custody';
import { ChainTimeline } from '@/components/chain-of-custody/chain-timeline';
import { IntegrityBadge, IntegrityDetails } from '@/components/chain-of-custody/integrity-badge';
import { Shield, AlertCircle } from 'lucide-react';

export default function ChainOfCustodyPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const { data: chainEvents = [], isLoading: chainLoading } = useCaseChain(selectedCaseId);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="text-brand-secondary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Chain of Custody</h1>
            <p className="text-gray-400">Immutable audit trail for all evidence</p>
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

        {selectedCaseId && chainEvents.length > 0 && (
          <>
            <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Case Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Case Number:</span>
                  <span className="ml-2 text-white font-mono">{selectedCase?.caseNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400">Case Name:</span>
                  <span className="ml-2 text-white">{selectedCase?.caseName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Events:</span>
                  <span className="ml-2 text-white">{chainEvents.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Files:</span>
                  <span className="ml-2 text-white">{selectedCase?.totalFiles}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Chain Events</h2>
              <ChainTimeline events={chainEvents} />
            </div>
          </>
        )}

        {selectedCaseId && chainEvents.length === 0 && !chainLoading && (
          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400">No chain of custody events found for this case.</p>
          </div>
        )}

        {!selectedCaseId && (
          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-12 text-center">
            <Shield className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400">Select a case to view its chain of custody.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
