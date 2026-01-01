'use client';

import { useState } from "react";
import { AppShell } from "../../components/app-shell";
import { useCases, useCreateCase, useDeleteCase } from "@/lib/hooks/queries/use-cases";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCaseSchema, CreateCaseFormData } from "@/lib/validation/schemas";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FolderOpen, Eye, FileText, Trash2, Plus } from "lucide-react";
import { formatDate, formatBytes } from "../../lib/utils";
import { toast } from "sonner";

export default function CasesPage() {
  const { data: cases = [], isLoading } = useCases();
  const createCase = useCreateCase();
  const deleteCase = useDeleteCase();
  const { user, isLoaded } = useUser();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
  });

  const onSubmit = async (data: CreateCaseFormData) => {
    console.log('Form submitted with data:', data);
    console.log('User:', user?.id);

    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to create a case.",
      });
      return;
    }

    try {
      const result = await createCase.mutateAsync(data);
      console.log('Case created successfully:', result);
      reset();
      toast.success("Case created successfully!", {
        description: `Case "${data.caseName}" has been created.`,
      });
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleDeleteCase = async (id: string) => {
    const caseToDelete = cases.find(c => c.id === id);
    if (window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      try {
        await deleteCase.mutateAsync(id);
        toast.success("Case deleted successfully", {
          description: caseToDelete ? `Case "${caseToDelete.caseName}" has been deleted.` : undefined,
        });
      } catch (error) {
        console.error("Error deleting case:", error);
        toast.error("Failed to delete case", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      }
    }
  };
  
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FolderOpen className="text-brand-secondary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Cases</h1>
            <p className="text-gray-400">Organize evidence into investigation cases</p>
          </div>
        </div>

        <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Case</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Case Name
              </label>
              <input
                {...register("caseName")}
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded-lg text-white focus:border-brand-secondary outline-none"
                placeholder="Enter case name"
              />
              {errors.caseName && (
                <p className="text-sm text-brand-danger mt-1">{errors.caseName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Case Officer
              </label>
              <input
                {...register("caseOfficer")}
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded-lg text-white focus:border-brand-secondary outline-none"
                placeholder="Enter officer name"
              />
              {errors.caseOfficer && (
                <p className="text-sm text-brand-danger mt-1">{errors.caseOfficer.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Department (Optional)
              </label>
              <input
                {...register("department")}
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded-lg text-white focus:border-brand-secondary outline-none"
                placeholder="Enter department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded-lg text-white focus:border-brand-secondary outline-none"
                placeholder="Enter case description"
              />
              {errors.description && (
                <p className="text-sm text-brand-danger mt-1">{errors.description.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={createCase.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 disabled:opacity-50"
            >
              {createCase.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Case
                </>
              )}
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Cases</h2>

          {isLoading && <div className="text-gray-400">Loading cases...</div>}

          {!isLoading && cases.length > 0 && (
            <div className="grid gap-4">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6 hover:border-brand-secondary transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{caseItem.caseName}</h3>
                        <span className="px-2 py-1 bg-brand-secondary/20 text-brand-secondary text-xs rounded font-mono">
                          {caseItem.caseNumber}
                        </span>
                      </div>
                      {caseItem.description && (
                        <p className="text-gray-400 mb-3">{caseItem.description}</p>
                      )}
                      <div className="flex gap-6 text-sm text-gray-400">
                        <div>
                          <span className="text-gray-500">Officer:</span>{" "}
                          <span className="text-white">{caseItem.caseOfficer}</span>
                        </div>
                        {caseItem.department && (
                          <div>
                            <span className="text-gray-500">Dept:</span>{" "}
                            <span className="text-white">{caseItem.department}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Files:</span>{" "}
                          <span className="text-white">{caseItem.totalFiles}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>{" "}
                          <span className="text-white">{formatBytes(caseItem.totalSize)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>{" "}
                          <span
                            className={
                              caseItem.caseStatus === "active"
                                ? "text-brand-success"
                                : "text-gray-400"
                            }
                          >
                            {caseItem.caseStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCase(caseItem.id)}
                        className="px-3 py-2 bg-brand-danger/20 text-brand-danger rounded-lg hover:bg-brand-danger/30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && cases.length === 0 && (
            <div className="text-center py-12 bg-brand-darkCard border border-brand-darkBorder rounded-lg">
              <FolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-white mb-2">No cases yet</h3>
              <p className="text-gray-400">Create your first case to organize evidence</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
} 