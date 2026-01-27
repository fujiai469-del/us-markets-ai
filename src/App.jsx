import { useState, useCallback } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookmarksPage from './pages/BookmarksPage';
import SettingsPage from './pages/SettingsPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  );
}

export default App;
