import NextAuth, { AuthOptions } from "next-auth";

const authOptions: AuthOptions = {
  providers: [
    {
      id: "oidc",
      name: process.env.PROTECTED_NEXUS_NAME!,
      type: "oauth",
      version: "2.0",
      wellKnown: process.env.PROTECTED_NEXUS_WELL_KNOWN,
      idToken: true,
      issuer: process.env.PROTECTED_NEXUS_ISSUER,
      checks: ["pkce", "state"],
      authorization: { params: { scope: "openid groups email oauth" } },
      async profile(profile: any, tokens: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      clientId: process.env.PROTECTED_NEXUS_CLIENT_ID,
      clientSecret: process.env.PROTECTED_NEXUS_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (account) {
        token = {
          ...token,
          user: user,
          access_token: account.access_token,
          accessTokenExpires: account.expires_at,
          refreshToken: account.refresh_token,
          access_token_url: account.access_token_url,
          id_token: account.id_token,
        };
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
