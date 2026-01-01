'use client';

import React from 'react';
import { ToastProvider } from "@/lib/hooks/use-toast";
import { QueryProvider } from "@/lib/providers/query-provider";
import { SupabaseProvider } from "@/lib/providers/supabase-provider";
import { ForensicStoreProvider } from "@/lib/hooks/use-forensic-store";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { ToastContainer } from "@/components/ui/toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <QueryProvider>
        <ForensicStoreProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen relative">
              <MotionWrapper mode="wait">
                {children}
              </MotionWrapper>
              <ToastContainer />
            </div>
          </ToastProvider>
        </ForensicStoreProvider>
      </QueryProvider>
    </SupabaseProvider>
  );
} 