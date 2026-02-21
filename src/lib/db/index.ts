
import { PrismaClient } from '@prisma/client';
import type { UserSession } from '@/types';
import crypto from 'crypto';


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.API_KEYS_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('API_KEYS_ENCRYPTION_SECRET environment variable is required');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

export function decryptApiKey(ciphertext: string): string {
  const key = getEncryptionKey();

  const iv = Buffer.from(ciphertext.slice(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(ciphertext.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2), 'hex');
  const encrypted = ciphertext.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}


export async function getUserById(id: string): Promise<UserSession | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    createdAt: user.createdAt,
  };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}


export async function getUserApiKey(userId: string, provider: string): Promise<string | null> {
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      userId_provider: { userId, provider },
    },
  });

  if (!apiKey) return null;

  return decryptApiKey(apiKey.encryptedKey);
}

export async function saveUserApiKey(userId: string, provider: string, key: string): Promise<void> {
  const encryptedKey = encryptApiKey(key);

  await prisma.apiKey.upsert({
    where: {
      userId_provider: { userId, provider },
    },
    update: {
      encryptedKey,
    },
    create: {
      userId,
      provider,
      encryptedKey,
    },
  });
}

export async function deleteUserApiKey(userId: string, provider: string): Promise<void> {
  await prisma.apiKey.delete({
    where: {
      userId_provider: { userId, provider },
    },
  }).catch(() => {
  });
}

export async function hasUserApiKey(userId: string, provider: string): Promise<boolean> {
  const count = await prisma.apiKey.count({
    where: { userId, provider },
  });
  return count > 0;
}


let isConnected = true;

export async function connectDatabase(): Promise<void> {
  isConnected = true;
}

export async function saveUserGame(params: {
  userId: string;
  name?: string;
  fen: string;
  turn: string;
  moveHistory: string[];
  statistics: object;
  evaluationScore: number;
  gameType?: 'analysis' | 'vsBot';
  evaluation?: number | null;
  topMoves?: object[] | null;
  difficulty?: string | null;
  playerColor?: string | null;
}): Promise<void> {
  // Auto-increment name if not provided
  let gameName = params.name;
  if (!gameName) {
    const count = await prisma.savedGame.count({ where: { userId: params.userId } });
    gameName = `Saved game #${count + 1}`;
  }
  await prisma.savedGame.create({
    data: {
      userId: params.userId,
      name: gameName,
      fen: params.fen,
      turn: params.turn,
      moveHistory: JSON.stringify(params.moveHistory),
      statistics: JSON.stringify(params.statistics),
      evaluationScore: params.evaluationScore,
      gameType: params.gameType || 'analysis',
      evaluation: params.evaluation ?? null,
      topMoves: params.topMoves ? JSON.stringify(params.topMoves) : null,
      difficulty: params.difficulty ?? null,
      playerColor: params.playerColor ?? null,
    }
  });
}

export async function getUserSavedGames(userId: string, order: 'asc' | 'desc' = 'desc') {
  return prisma.savedGame.findMany({
    where: { userId },
    orderBy: { createdAt: order },
  });
}

export async function getSavedGameById(userId: string, gameId: string) {
  return prisma.savedGame.findFirst({
    where: { id: gameId, userId },
  });
}

export async function deleteSavedGame(userId: string, gameId: string): Promise<boolean> {
  const game = await prisma.savedGame.findFirst({
    where: { id: gameId, userId },
  });
  if (!game) return false;
  await prisma.savedGame.delete({ where: { id: gameId } });
  return true;
}

export async function deleteAllSavedGames(userId: string): Promise<number> {
  const result = await prisma.savedGame.deleteMany({ where: { userId } });
  return result.count;
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  isConnected = false;
}
