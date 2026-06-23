'use client';

import { useState, useCallback } from 'react';
import { RichTextEditor } from './RichTextEditor';

interface ContentEditorProps {
  contentId: string;
  initialContent: string;
  fieldName: string;
  onSave?: (content: string) => void;
  apiEndpoint?: string;
}

export function ContentEditor({
  contentId,
  initialContent,
  fieldName,
  onSave,
  apiEndpoint = '/api/site-content',
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = useCallback((html: string) => {
    setContent(html);
    setHasChanges(html !== initialContent);
    setError(null);
  }, [initialContent]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fieldName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to save');
      }

      setLastSaved(new Date());
      setHasChanges(false);
      onSave?.(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  }, [content, contentId, fieldName, hasChanges, apiEndpoint, onSave]);

  const handleReset = useCallback(() => {
    setContent(initialContent);
    setHasChanges(false);
    setError(null);
  }, [initialContent]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{fieldName}</h3>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {hasChanges && (
            <span className="text-xs text-amber-600 font-medium">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      <RichTextEditor
        content={content}
        onChange={handleChange}
        placeholder={`Enter ${fieldName.toLowerCase()} content...`}
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasChanges && !isSaving
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {hasChanges && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Discard Changes
          </button>
        )}
      </div>
    </div>
  );
}

export default ContentEditor;
