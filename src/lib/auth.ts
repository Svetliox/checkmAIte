// =============================================================================
// checkmAIte - NextAuth.js Configuration
// =============================================================================
// Handles user authentication with credentials (email/password)
// Uses JWT strategy (edge-compatible)
// =============================================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// NextAuth configuration - edge-compatible
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt', // Use JWT for stateless sessions (edge-compatible)
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Dynamic import to avoid edge runtime issues
        const { prisma } = await import('./db');
        const bcrypt = await import('bcrypt');

        // Find user by email or by name (for checkmAIte user)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { name: email }, // Allow login with username
            ],
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
