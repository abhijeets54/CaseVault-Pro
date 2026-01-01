'use client';

import React from 'react';

interface CaseVaultLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export function CaseVaultLogo({
  size = 40,
  className = '',
  showText = true,
  animated = false,
}: CaseVaultLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Shield with Lock Icon */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animated ? 'animate-pulse-ring' : ''}
        >
          {/* Shield Background */}
          <path
            d="M50 5 L85 20 L85 50 Q85 75 50 95 Q15 75 15 50 L15 20 Z"
            fill="url(#shieldGradient)"
            stroke="#7C3AED"
            strokeWidth="3"
          />

          {/* Lock Body */}
          <rect
            x="35"
            y="50"
            width="30"
            height="25"
            rx="3"
            fill="#0F172A"
            stroke="#F59E0B"
            strokeWidth="2"
          />

          {/* Lock Shackle */}
          <path
            d="M42 50 V42 Q42 35 50 35 Q58 35 58 42 V50"
            stroke="#F59E0B"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Keyhole */}
          <circle cx="50" cy="60" r="3" fill="#F59E0B" />
          <rect x="48.5" y="60" width="3" height="8" rx="1" fill="#F59E0B" />

          {/* Premium Badge Dot */}
          <circle
            cx="75"
            cy="25"
            r="6"
            fill="#F59E0B"
            className={animated ? 'animate-pulse' : ''}
          />

          <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-brand-secondary to-brand-accent bg-clip-text text-transparent">
            CaseVault
          </span>
          <span className="text-xs font-semibold text-brand-accent tracking-wider uppercase">
            Pro
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for small spaces
export function CaseVaultLogoCompact({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 5 L85 20 L85 50 Q85 75 50 95 Q15 75 15 50 L15 20 Z"
        fill="url(#compactGradient)"
        stroke="#7C3AED"
        strokeWidth="3"
      />
      <rect
        x="35"
        y="50"
        width="30"
        height="25"
        rx="3"
        fill="#0F172A"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <path
        d="M42 50 V42 Q42 35 50 35 Q58 35 58 42 V50"
        stroke="#F59E0B"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="50" cy="60" r="3" fill="#F59E0B" />
      <rect x="48.5" y="60" width="3" height="8" rx="1" fill="#F59E0B" />
      <circle cx="75" cy="25" r="6" fill="#F59E0B" />
      <defs>
        <linearGradient id="compactGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Text-only version
export function CaseVaultText({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      <span className="text-2xl font-bold bg-gradient-to-r from-brand-secondary to-brand-accent bg-clip-text text-transparent">
        CaseVault
      </span>
      <span className="text-sm font-semibold text-brand-accent">Pro</span>
    </div>
  );
}

export default CaseVaultLogo;
