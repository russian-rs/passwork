import NextAuth from "next-auth";
import Authentik from "next-auth/providers/authentik";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Authentik({
      clientId: process.env.AUTHENTIK_CLIENT_ID!,
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
      issuer: `${process.env.AUTHENTIK_URL?.replace(/\/$/, "")}/application/o/${process.env.AUTHENTIK_CLIENT_ID}/`,
      authorization: { params: { scope: "openid email profile offline_access" } },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          sub: user.id,
          accessToken: account.access_token,
          expiresAt: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          refreshToken: account.refresh_token,
          absoluteExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
        };
      }

      // Check absolute expiration (1 week limit)
      if (Date.now() > (token.absoluteExpiry as number)) {
        return { ...token, error: "ForceLoginRequired" };
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) - 60 * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      try {
        const issuer = `${process.env.AUTHENTIK_URL?.replace(/\/$/, "")}/application/o/${process.env.AUTHENTIK_CLIENT_ID}`;
        const wellKnownRes = await fetch(`${issuer}/.well-known/openid-configuration`);
        const wellKnown = await wellKnownRes.json();
        
        const basicAuth = btoa(`${process.env.AUTHENTIK_CLIENT_ID}:${process.env.AUTHENTIK_CLIENT_SECRET}`);

        const response = await fetch(wellKnown.token_endpoint, {
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
          },
          body: new URLSearchParams({
            client_id: process.env.AUTHENTIK_CLIENT_ID!,
            grant_type: "refresh_token",
            refresh_token: (token.refreshToken as string) || "",
          }),
          method: "POST",
        });

        const responseText = await response.text();
        
        let tokens;
        try {
          tokens = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Invalid JSON from token endpoint. Status: ${response.status}. Body: ${responseText.substring(0, 200)}`);
        }

        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          expiresAt: Date.now() + (tokens.expires_in || 300) * 1000,
          // Fall back to old refresh token if a new one is not returned
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub as string;
      }
      if (token?.error) {
        (session as any).error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
