'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { useCases } from '@/lib/hooks/queries/use-cases';
import { useCaseTags } from '@/lib/hooks/queries/use-tags';
import { Tags as TagsIcon, Tag, FileText } from 'lucide-react';

export default function TagsPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const { data: cases = [] } = useCases();
  const { data: tags = [], isLoading } = useCaseTags(selectedCaseId);

  const groupedByTag = tags.reduce((acc, tag) => {
    if (!acc[tag.tagName]) {
      acc[tag.tagName] = [];
    }
    acc[tag.tagName].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <TagsIcon className="text-brand-secondary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Evidence Tags</h1>
            <p className="text-gray-400">Manage and organize evidence with tags</p>
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

        {selectedCaseId && (
          <>
            {tags.length > 0 && (
              <div className="grid gap-4">
                {Object.entries(groupedByTag).map(([tagName, taggedFiles]) => (
                  <div
                    key={tagName}
                    className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: taggedFiles[0].tagColor }}
                      />
                      <h3 className="text-lg font-semibold text-white">{tagName}</h3>
                      <span className="text-sm text-gray-400">
                        ({taggedFiles.length} file{taggedFiles.length === 1 ? '' : 's'})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {taggedFiles.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center gap-3 p-3 bg-brand-darkBg rounded-lg"
                        >
                          <FileText className="text-gray-400" size={18} />
                          <div className="flex-1">
                            <p className="text-white font-mono text-sm truncate">
                              {tag.fileHash}
                            </p>
                            {tag.notes && (
                              <p className="text-gray-400 text-sm mt-1">{tag.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tags.length === 0 && !isLoading && (
              <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-12 text-center">
                <Tag className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-400">No tags found for this case.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Tags can be added from the file analysis page.
                </p>
              </div>
            )}
          </>
        )}

        {!selectedCaseId && (
          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-12 text-center">
            <TagsIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400">Select a case to view its tags.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
