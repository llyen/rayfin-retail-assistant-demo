import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/AuthContext';
import AuthPage from './components/AuthPage';
import ChatPage from './pages/ChatPage';
import KnowledgePage from './pages/KnowledgePage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-full items-center justify-center text-slate-500">Loading…</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:conversationId" element={<ChatPage />} />
      <Route path="/knowledge" element={<KnowledgePage />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
