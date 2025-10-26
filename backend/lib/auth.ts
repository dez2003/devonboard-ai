import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { supabaseAdmin } from "./supabase/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Check if user exists in Supabase
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          // Create new user
          await supabaseAdmin
            .from('users')
            .insert({
              email: user.email,
              name: user.name,
              role: 'developer' // Default role
            });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Still allow sign in even if DB operation fails
      }
    },

    async session({ session, token }) {
      if (session.user && session.user.email) {
        try {
          // Fetch user data from Supabase
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id, organization_id, role')
            .eq('email', session.user.email)
            .single();

          if (userData) {
            // Add custom fields to session
            session.user.id = userData.id;
            session.user.organizationId = userData.organization_id;
            session.user.role = userData.role;
          }
        } catch (error) {
          console.error('Error in session callback:', error);
        }
      }

      return session;
    },

    async jwt({ token, user, account }) {
      // Persist user data in JWT
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
