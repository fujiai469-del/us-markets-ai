import { useState, useCallback, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookmarksPage from './pages/BookmarksPage';
import SettingsPage from './pages/SettingsPage';
import ErrorBoundary from './components/ErrorBoundary';

// Apply saved settings on initial load
function applyInitialSettings() {
  const savedTheme = localStorage.getItem('us-markets-theme');
  const savedFontSize = localStorage.getItem('us-markets-font-size') || 'medium';

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
  document.documentElement.classList.add(`font-${savedFontSize}`);
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply initial settings on mount
  useEffect(() => {
    applyInitialSettings();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const setRefreshingState = useCallback((state) => {
    setIsRefreshing(state);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            refreshTrigger={refreshTrigger}
            onRefreshingChange={setRefreshingState}
          />
        );
      case 'search':
        return <SearchPage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            refreshTrigger={refreshTrigger}
            onRefreshingChange={setRefreshingState}
          />
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header
          onRefresh={activeTab === 'home' ? handleRefresh : null}
          isLoading={isRefreshing}
        />
        <main className="flex-1 overflow-y-auto pt-2">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AuthProvider>
  );
}

export default App;
