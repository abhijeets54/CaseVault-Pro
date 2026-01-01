'use client';

import { AppShell } from "../../components/app-shell";
import { useCases, useCaseStats } from "@/lib/hooks/queries/use-cases";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Upload, FolderOpen, FileText, BarChart3, Shield, Search } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const { data: stats, isLoading: statsLoading } = useCaseStats();

  const activeCases = cases.filter((c) => c.caseStatus === "active");
  const closedCases = cases.filter((c) => c.caseStatus === "closed");

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-gray-400">CaseVault Pro - Enterprise Evidence Intelligence Platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Cases</h3>
              <FolderOpen className="text-brand-secondary" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalCases || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats?.activeCases || 0} active
            </p>
          </div>

          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Evidence Files</h3>
              <FileText className="text-brand-accent" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalFiles || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatBytes(stats?.totalSize || 0)}
            </p>
          </div>

          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Active Cases</h3>
              <BarChart3 className="text-brand-success" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.activeCases || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats?.closedCases || 0} closed
            </p>
          </div>

          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Chain Events</h3>
              <Shield className="text-brand-info" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">--</p>
            <p className="text-sm text-gray-500 mt-1">COC tracked</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/upload"
            className="bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-lg p-6 flex items-center gap-4 transition"
          >
            <Upload size={32} />
            <div>
              <h3 className="font-bold text-lg">Upload Evidence</h3>
              <p className="text-sm text-white/80">Add files to a case</p>
            </div>
          </Link>

          <Link
            href="/cases"
            className="bg-brand-darkCard hover:bg-brand-darkCard/80 border border-brand-darkBorder text-white rounded-lg p-6 flex items-center gap-4 transition"
          >
            <FolderOpen size={32} className="text-brand-secondary" />
            <div>
              <h3 className="font-bold text-lg">Manage Cases</h3>
              <p className="text-sm text-gray-400">View all cases</p>
            </div>
          </Link>

          <Link
            href="/search"
            className="bg-brand-darkCard hover:bg-brand-darkCard/80 border border-brand-darkBorder text-white rounded-lg p-6 flex items-center gap-4 transition"
          >
            <Search size={32} className="text-brand-accent" />
            <div>
              <h3 className="font-bold text-lg">Search Evidence</h3>
              <p className="text-sm text-gray-400">Find files</p>
            </div>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Cases</h2>
          {casesLoading && <div className="text-gray-400">Loading...</div>}
          {!casesLoading && activeCases.length > 0 && (
            <div className="grid gap-4">
              {activeCases.slice(0, 5).map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-4 hover:border-brand-secondary transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{caseItem.caseName}</h3>
                      <p className="text-sm text-gray-400">{caseItem.caseNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{caseItem.totalFiles} files</p>
                      <p className="text-sm text-gray-500">
                        {formatBytes(caseItem.totalSize)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!casesLoading && activeCases.length === 0 && (
            <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-8 text-center">
              <p className="text-gray-400">No active cases. Create your first case to get started.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
