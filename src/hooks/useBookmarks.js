import { useState, useEffect, useCallback } from 'react';

const BOOKMARKS_KEY = 'us-markets-ai-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse bookmarks:', error);
        setBookmarks([]);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
  }, []);

  const addBookmark = useCallback((article) => {
    const exists = bookmarks.some((b) => b.url === article.url);
    if (!exists) {
      const newBookmarks = [
        {
          ...article,
          bookmarkedAt: new Date().toISOString(),
        },
        ...bookmarks,
      ];
      saveBookmarks(newBookmarks);
    }
  }, [bookmarks, saveBookmarks]);

  const removeBookmark = useCallback((articleUrl) => {
    const newBookmarks = bookmarks.filter((b) => b.url !== articleUrl);
    saveBookmarks(newBookmarks);
  }, [bookmarks, saveBookmarks]);

  const toggleBookmark = useCallback((article) => {
    const exists = bookmarks.some((b) => b.url === article.url);
    if (exists) {
      removeBookmark(article.url);
    } else {
      addBookmark(article);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const isBookmarked = useCallback((articleUrl) => {
    return bookmarks.some((b) => b.url === articleUrl);
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  };
}
