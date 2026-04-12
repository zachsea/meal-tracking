import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import Discord from "next-auth/providers/discord";
import type { NextAuthOptions } from "next-auth";
import { env } from "@/env";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  providers: [
    Discord({
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
    }),
  ],
};
