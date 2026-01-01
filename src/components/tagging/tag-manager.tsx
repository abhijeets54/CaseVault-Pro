'use client';

import { useState } from 'react';
import { useFileTags, useCreateTag, useDeleteTag } from '@/lib/hooks/queries/use-tags';
import { Plus, X, Tag as TagIcon } from 'lucide-react';

interface TagManagerProps {
  caseId: string;
  fileHash: string;
}

const TAG_COLORS = [
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
];

export function TagManager({ caseId, fileHash }: TagManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);

  const { data: tags = [], isLoading } = useFileTags(caseId, fileHash);
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    await createTag.mutateAsync({
      caseId,
      fileHash,
      tagName: newTagName.trim(),
      tagColor: selectedColor,
    });

    setNewTagName('');
    setIsAdding(false);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (confirm('Delete this tag?')) {
      await deleteTag.mutateAsync(tagId);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: tag.tagColor + '20', color: tag.tagColor }}
          >
            <TagIcon size={14} />
            {tag.tagName}
            <button
              onClick={() => handleDeleteTag(tag.id)}
              className="hover:opacity-70"
            >
              <X size={14} />
            </button>
          </span>
        ))}

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition"
          >
            <Plus size={14} />
            Add Tag
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tag Name</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded text-white focus:border-brand-secondary outline-none"
                placeholder="e.g., Suspicious, Important"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Color</label>
              <div className="flex gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full transition ${
                      selectedColor === color.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-darkCard'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim() || createTag.isPending}
                className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 disabled:opacity-50"
              >
                {createTag.isPending ? 'Adding...' : 'Add Tag'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewTagName('');
                }}
                className="px-4 py-2 bg-brand-darkBg text-gray-300 rounded-lg hover:bg-brand-darkBorder"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
