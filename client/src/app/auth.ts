import { NextAuthOptions, DefaultSession, User } from "next-auth";
import { refreshAccessToken } from "./auth/refreshTokenHandler";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "oidc",
      name: process.env.PROTECTED_IDP_NAME!,
      type: "oauth",
      version: "2.0",
      wellKnown: process.env.PROTECTED_IDP_WELL_KNOWN,
      idToken: true,
      issuer: process.env.PROTECTED_IDP_ISSUER,
      checks: ["pkce", "state"],
      authorization: {
        url: process.env.PROTECTED_IDP_AUTH_URL,
        params: {
          scope: process.env.PROTECTED_IDP_SCOPE,
          redirect_uri: process.env.PROTECTED_IDP_REDIRECT_URI,
        },
      },
      token: process.env.PROTECTED_IDP_TOKEN_URL,
      userinfo: process.env.PROTECTED_IDP_USERINFO_URL,
      jwks_endpoint: process.env.PROTECTED_IDP_JWKS_URL,
      async profile(profile: any, tokens: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      clientId: process.env.PROTECTED_IDP_CLIENT_ID,
      clientSecret: process.env.PROTECTED_IDP_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + process.env.NEXT_PUBLIC_BASE_PATH || "";
    },
    async session({ session, token }) {
      if (token) {
        const user = token.user as User;
        session.user = {
          name: user.name,
        };
      }
      return session;
    },
    async jwt({ token, user, account, profile, trigger }) {
      // Initial sign in
      if (account && user) {
        return {
          access_token: account.access_token,
          ...accessTokenTimes(account.expires_at ? account.expires_at - Math.floor(Date.now() / 1000) : (account.expires_in as number | undefined)),
          refreshToken: account.refresh_token,
          access_token_url: account.access_token_url,
          user: user,
        };
      }

      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      const refreshAt = (token.accessTokenRefreshAt ?? token.accessTokenExpires) as number | undefined;
      if (refreshAt && Date.now() < refreshAt) {
        return token;
      }

      const refreshedToken = await refreshAccessToken(
        token,
        process.env.PROTECTED_IDP_SCOPE!,
        process.env.PROTECTED_IDP_TOKEN_URL!,
        process.env.PROTECTED_IDP_CLIENT_ID!,
        process.env.PROTECTED_IDP_CLIENT_SECRET!
      );
      if (refreshedToken.error) {
        // Only sign out if the refresh token was rejected, otherwise retry on next request
        return refreshedToken.fatal ? { ...token, error: "RefreshAccessTokenError" } : token;
      }

      return {
        ...token,
        access_token: refreshedToken.access_token,
        ...accessTokenTimes(refreshedToken.expires_in),
        refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        error: undefined,
      };
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.PROTECTED_SESSION_MAXAGE || "") || 8 * 60 * 60, // 8 hours
  },
};

// Refresh 60 seconds before the access token expires (or halfway for short-lived tokens)
function accessTokenTimes(expiresIn: number | undefined) {
  const lifetimeMs = (expiresIn || parseInt(process.env.PROTECTED_IDP_SESSION_MAXAGE || "") || 300) * 1000;
  const marginMs = Math.min(60 * 1000, lifetimeMs / 2);
  const now = Date.now();
  return {
    accessTokenExpires: now + lifetimeMs,
    accessTokenRefreshAt: now + lifetimeMs - marginMs,
  };
}
