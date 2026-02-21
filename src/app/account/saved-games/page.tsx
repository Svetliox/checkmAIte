import { auth } from '@/lib/auth';
import { getUserSavedGames } from '@/lib/db';
import React from 'react';
import type { SavedGame } from '@/types';

export const metadata = {
  title: 'Saved Games',
};

import SavedGamesList from './SavedGamesList';

export default async function SavedGamesPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8 text-center text-accent-danger">You must be logged in to view saved games.</div>;
  }
  const params = await searchParams;
  const order = params?.order === 'asc' ? 'asc' : 'desc';
  const games = await getUserSavedGames(session.user.id, order) as SavedGame[];
  return <SavedGamesList games={games} initialOrder={order} />;
}