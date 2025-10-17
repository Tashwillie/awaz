import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token.provider) {
        (session as { provider?: string }).provider = token.provider as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }


