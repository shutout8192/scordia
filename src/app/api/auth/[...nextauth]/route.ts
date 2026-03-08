import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    // Googleログイン (本番・APIキー取得後)
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ] : []),
    // 開発用モック認証 (MOCK_AUTH_ENABLED=true の場合)
    ...(process.env.MOCK_AUTH_ENABLED === 'true' ? [
      CredentialsProvider({
        name: '開発用モックログイン',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email) return null;
          return { id: 'mock-user', name: 'Dev User', email: credentials.email };
        },
      })
    ] : []),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
