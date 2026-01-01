'use client';

import { IntegrityResult } from '@/lib/types';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface IntegrityBadgeProps {
  integrity: IntegrityResult;
  size?: 'sm' | 'md' | 'lg';
}

export function IntegrityBadge({ integrity, size = 'md' }: IntegrityBadgeProps) {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg';

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
        integrity.isValid
          ? 'bg-brand-success/20 text-brand-success border border-brand-success/30'
          : 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30'
      }`}
    >
      {integrity.isValid ? (
        <CheckCircle size={iconSize} />
      ) : (
        <AlertTriangle size={iconSize} />
      )}
      <span className={`font-semibold ${textSize}`}>
        {integrity.isValid ? 'Chain Verified' : 'Integrity Issues'}
      </span>
      <span className={`${textSize} opacity-80`}>
        ({integrity.totalEvents} events)
      </span>
    </div>
  );
}

export function IntegrityDetails({ integrity }: { integrity: IntegrityResult }) {
  return (
    <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="text-brand-secondary" size={24} />
        <h3 className="text-xl font-bold text-white">Chain Integrity</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span
            className={`font-semibold ${
              integrity.isValid ? 'text-brand-success' : 'text-brand-danger'
            }`}
          >
            {integrity.isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Events:</span>
          <span className="text-white">{integrity.totalEvents}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Errors:</span>
          <span className="text-white">{integrity.errors.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Verified At:</span>
          <span className="text-white text-sm">{new Date(integrity.verifiedAt).toLocaleString()}</span>
        </div>

        {integrity.errors.length > 0 && (
          <div className="mt-4 p-3 bg-brand-danger/10 border border-brand-danger/30 rounded">
            <p className="text-sm font-semibold text-brand-danger mb-2">
              Integrity Errors:
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              {integrity.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
