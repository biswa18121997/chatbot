import React, { useState } from 'react';
import { NhostProvider } from '@nhost/react';
import { ApolloProvider } from '@apollo/client';
import { nhost } from './lib/nhost';
import { apolloClient } from './lib/apollo';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { ChatInterface } from './components/chat/ChatInterface';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AuthForm
              mode={authMode}
              onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppContent />
      </ApolloProvider>
    </NhostProvider>
  );
}

export default App;