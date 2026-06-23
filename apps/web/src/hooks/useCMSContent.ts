'use client';
import { useState, useEffect } from 'react';

interface CMSContent {
  id: string;
  section: string;
  key: string;
  content_type: string;
  value: string;
  is_active: boolean;
}

export function useCMSContent() {
  const [content, setContent] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();

    // Listen for content updates from dashboard
    const handleContentUpdate = () => {
      fetchContent();
    };

    window.addEventListener('cms-content-updated', handleContentUpdate);

    return () => {
      window.removeEventListener('cms-content-updated', handleContentUpdate);
    };
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/site-content-public');

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();

      if (data.success) {
        setContent(data.content);
        setError(null);
      } else {
        setError(data.message || 'Failed to load content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getContent = (section: string, key: string): string => {
    const item = content.find(c => c.section === section && c.key === key && c.is_active);
    return item?.value || '';
  };

  const getHeroImages = (): string[] => {
    const heroItem = content.find(c => c.section === 'hero' && c.key === 'images' && c.is_active);
    if (heroItem?.value) {
      try {
        return JSON.parse(heroItem.value);
      } catch {
        return heroItem.value ? [heroItem.value] : [];
      }
    }
    return [];
  };

  return {
    content,
    loading,
    error,
    getContent,
    getHeroImages,
    refetch: fetchContent,
  };
}
