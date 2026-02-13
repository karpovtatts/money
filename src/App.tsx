import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy loading для страниц
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddTransaction = lazy(() => import('./pages/AddTransaction'));
const History = lazy(() => import('./pages/History'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Fallback компонент для Suspense
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      <p>Загрузка...</p>
    </div>
  </div>
);

function App() {
  const toast = useToast();

  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Layout>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ErrorBoundary>
  );
}

export default App;
