import React from 'react';
import { LibraryProvider, useLibrary } from './components/LibraryContext';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { BookViewer } from './components/BookViewer';
import { LoginPage } from './components/LoginPage';
import { AdminPage } from './components/AdminPage';
import { Toaster } from "./components/ui/sonner";

const AppContent: React.FC = () => {
  const { state } = useLibrary();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'home':
        return <HomePage />;
      case 'catalog':
        return <CatalogPage />;
      case 'viewer':
        return <BookViewer />;
      case 'login':
        return <LoginPage />;
      case 'admin':
        return state.isAuthenticated ? <AdminPage /> : <LoginPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      {renderCurrentView()}
      <Toaster />
    </>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}