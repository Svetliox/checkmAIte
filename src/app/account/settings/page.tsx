
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Container, Button, Card } from '@/components/ui';

export default function SettingsPage() {
  const { data: session } = useSession();

  const [groqApiKey, setGroqApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadApiKeyStatus() {
      try {
        const response = await fetch('/api/user/api-keys?provider=groq');
        const data = await response.json();
        if (data.hasKey) {
          setHasExistingKey(true);
          setGroqApiKey('••••••••••••••••••••');
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadApiKeyStatus();
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    if (groqApiKey === '••••••••••••••••••••') {
      setMessage({ type: 'error', text: 'Please enter a new API key to update' });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'groq', key: groqApiKey }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'API key saved successfully!' });
        setHasExistingKey(true);
        setGroqApiKey('••••••••••••••••••••');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save API key' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete your API key?')) return;

    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/api-keys?provider=groq', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'API key deleted successfully!' });
        setHasExistingKey(false);
        setGroqApiKey('');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete API key' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <Container size="md">
        <Link
          href="/account"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Account
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure your AI API keys and preferences</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI API Keys</h2>
              <p className="text-gray-400 text-sm">
                Add your API keys to enable AI-powered chess commentary
              </p>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
            <p className="text-cyan-300 text-sm">
              <strong>Groq API</strong> provides fast AI inference for chess commentary. Get your free
              API key at{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-cyan-200"
              >
                console.groq.com/keys
              </a>
            </p>
          </div>

          <form onSubmit={handleSaveApiKey} className="space-y-4">
            {message && (
              <div
                className={`rounded-lg p-3 ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="groqApiKey" className="block text-sm font-medium text-gray-300 mb-2">
                Groq API Key
              </label>
              <div className="flex gap-3">
                <input
                  id="groqApiKey"
                  type={groqApiKey === '••••••••••••••••••••' ? 'text' : 'password'}
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  onFocus={() => {
                    if (groqApiKey === '••••••••••••••••••••') {
                      setGroqApiKey('');
                    }
                  }}
                  placeholder={isLoading ? 'Loading...' : 'gsk_...'}
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <Button type="submit" variant="primary" disabled={isSaving || isLoading}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {hasExistingKey && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-emerald-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  API key configured
                </span>
                <button
                  type="button"
                  onClick={handleDeleteApiKey}
                  disabled={isSaving}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete key
                </button>
              </div>
            )}
          </form>
        </Card>

        <Card className="p-6 bg-gray-800/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Security</h3>
              <p className="text-gray-400 text-sm">
                Your API keys are encrypted before being stored in our database. They are only
                decrypted when needed to make API calls on your behalf.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}
