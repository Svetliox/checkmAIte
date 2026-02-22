'use client';


import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Container, Button, Card } from '@/components/ui';

export default function AccountPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-white mb-1">
                  {user.name || 'Chess Player'}
                </h2>
                <p className="text-gray-400 text-sm mb-6">{user.email}</p>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Settings</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Configure your AI API keys, analysis engine depth and chess theme preferences.
                  </p>
                </div>
                <Link href="/account/settings">
                  <Button variant="primary" size="sm">
                    Configure
                  </Button>
                </Link>
              </div>
            </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                            d="M5 3v4m0 0V3m0 4h4m-4 0H1m18 14v-4m0 0v4m0-4h-4m4 0h4M7 7l10 10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Saved Games</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      View and manage your saved chess games.
                    </p>
                  </div>
                  <Link href="/account/saved-games">
                    <Button variant="primary" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/modes" className="block">
                  <div className="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-center">
                    <svg
                      className="w-8 h-8 text-cyan-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-200 text-sm font-medium">Play</span>
                  </div>
                </Link>
                <Link href="/analysis" className="block">
                  <div className="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-center">
                    <svg
                      className="w-8 h-8 text-emerald-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="text-gray-200 text-sm font-medium">Analyze</span>
                  </div>
                </Link>
                <Link href="/help" className="block">
                  <div className="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-center">
                    <svg
                      className="w-8 h-8 text-yellow-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-200 text-sm font-medium">Help</span>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
