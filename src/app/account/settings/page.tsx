
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Container, Button, Card } from '@/components/ui';

const ANALYSIS_DEPTH_KEY = 'checkmaite_analysis_depth';
const DEFAULT_ANALYSIS_DEPTH = 10;
const MIN_DEPTH = 5;
const MAX_DEPTH = 25;

export default function SettingsPage() {
  const { data: session } = useSession();

  const [groqApiKey, setGroqApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [analysisDepth, setAnalysisDepth] = useState(DEFAULT_ANALYSIS_DEPTH);
  const [depthSaved, setDepthSaved] = useState(false);

  const [chessTheme, setChessTheme] = useState<'ORIGINAL' | 'MODERN'>('ORIGINAL');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeMessage, setThemeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    
    // Load analysis depth from localStorage
    const savedDepth = localStorage.getItem(ANALYSIS_DEPTH_KEY);
    if (savedDepth) {
      const parsed = parseInt(savedDepth, 10);
      if (!isNaN(parsed) && parsed >= MIN_DEPTH && parsed <= MAX_DEPTH) {
        setAnalysisDepth(parsed);
      }
    }

    // Load chess theme preference
    async function loadChessTheme() {
      try {
        const response = await fetch('/api/user/theme');
        const data = await response.json();
        if (data.theme) {
          setChessTheme(data.theme);
        }
      } catch {
        console.error('Failed to load chess theme');
      }
    }
    loadChessTheme();
  }, []);

  const handleDepthChange = (value: number) => {
    const clamped = Math.max(MIN_DEPTH, Math.min(MAX_DEPTH, value));
    setAnalysisDepth(clamped);
    localStorage.setItem(ANALYSIS_DEPTH_KEY, clamped.toString());
    setDepthSaved(true);
    setTimeout(() => setDepthSaved(false), 2000);
  };

  const handleThemeChange = async (newTheme: 'ORIGINAL' | 'MODERN') => {
    setThemeMessage(null);
    setThemeSaving(true);

    try {
      const response = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (response.ok) {
        setChessTheme(newTheme);
        setThemeMessage({ type: 'success', text: 'Theme updated successfully!' });
        setTimeout(() => setThemeMessage(null), 3000);
      } else {
        const data = await response.json();
        setThemeMessage({ type: 'error', text: data.error || 'Failed to update theme' });
      }
    } catch {
      setThemeMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setThemeSaving(false);
    }
  };

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

        {/* Engine Settings Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Engine Settings</h2>
              <p className="text-gray-400 text-sm">
                Configure chess engine behavior for analysis mode
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="analysisDepth" className="block text-sm font-medium text-gray-300 mb-2">
                Analysis Depth: <span className="text-purple-400 font-bold">{analysisDepth}</span>
              </label>
              <input
                id="analysisDepth"
                type="range"
                min={MIN_DEPTH}
                max={MAX_DEPTH}
                value={analysisDepth}
                onChange={(e) => handleDepthChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast ({MIN_DEPTH})</span>
                <span>Balanced (10-15)</span>
                <span>Deep ({MAX_DEPTH})</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-amber-300 text-sm">
                  <strong>Note:</strong> Higher depth values provide more accurate analysis but 
                  significantly increase calculation time. Values above 15 may cause noticeable 
                  delays on slower devices.
                </p>
              </div>
            </div>

            {depthSaved && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Settings saved
              </div>
            )}
          </div>
        </Card>

        {/* Chess Theme Preference Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Chess Theme Preference</h2>
              <p className="text-gray-400 text-sm">
                Customize the appearance of the chess board across all game modes
              </p>
            </div>
          </div>

          {themeMessage && (
            <div
              className={`rounded-lg p-3 mb-4 ${
                themeMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <p
                className={`text-sm ${
                  themeMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {themeMessage.text}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Modern Theme */}
              <button
                onClick={() => handleThemeChange('MODERN')}
                disabled={themeSaving || chessTheme === 'MODERN'}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  chessTheme === 'MODERN'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                } ${themeSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {chessTheme === 'MODERN' && (
                  <div className="absolute top-3 right-3">
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-left">
                    <h3 className="text-white font-semibold">Modern</h3>
                    <p className="text-gray-400 text-sm">Green & White</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 aspect-square">
                  {[0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3].map((row, i) => (
                    <div
                      key={i}
                      className={`${
                        (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? 'bg-[#769656]' : 'bg-[#e8eaed]'
                      } rounded-sm`}
                    />
                  ))}
                </div>
              </button>

              {/* Original Theme */}
              <button
                onClick={() => handleThemeChange('ORIGINAL')}
                disabled={themeSaving || chessTheme === 'ORIGINAL'}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  chessTheme === 'ORIGINAL'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                } ${themeSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {chessTheme === 'ORIGINAL' && (
                  <div className="absolute top-3 right-3">
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-left">
                    <h3 className="text-white font-semibold">Original</h3>
                    <p className="text-gray-400 text-sm">Brown & White</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 aspect-square">
                  {[0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3].map((row, i) => (
                    <div
                      key={i}
                      className={`${
                        (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'
                      } rounded-sm`}
                    />
                  ))}
                </div>
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Your selected theme will be applied across all chess game 
                modes including Analysis and Play vs Bot.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}
