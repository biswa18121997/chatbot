import React, { useState } from 'react';
import { useSignUpEmailPassword, useSignInEmailPassword } from '@nhost/react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Mail, Lock, User } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {
    signUpEmailPassword,
    isLoading: signUpLoading,
    isSuccess: signUpSuccess,
    error: signUpError,
  } = useSignUpEmailPassword();

  const {
    signInEmailPassword,
    isLoading: signInLoading,
    error: signInError,
  } = useSignInEmailPassword();

  const isLoading = signUpLoading || signInLoading;
  const error = signUpError || signInError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        return;
      }
      await signUpEmailPassword(email, password);
    } else {
      await signInEmailPassword(email, password);
    }
  };

  if (signUpSuccess) {
    return (
      <div className="text-center">
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Check Your Email
          </h3>
          <p className="text-green-700">
            We've sent you a confirmation link. Please check your email to verify your account.
          </p>
        </div>
        <Button variant="outline" onClick={() => onToggleMode()}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-slate-600 mt-2">
          {mode === 'signin' 
            ? 'Sign in to your account to continue' 
            : 'Sign up to start chatting with AI'
          }
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        fullWidth
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        fullWidth
      />

      {mode === 'signup' && (
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          fullWidth
          error={
            confirmPassword && password !== confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
        />
      )}

      <Button
        type="submit"
        disabled={isLoading || (mode === 'signup' && password !== confirmPassword)}
        fullWidth
        size="lg"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : mode === 'signin' ? (
          'Sign In'
        ) : (
          'Create Account'
        )}
      </Button>

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'
          }
        </button>
      </div>
    </form>
  );
}