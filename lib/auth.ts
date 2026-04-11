import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import Discord from "next-auth/providers/discord";
import type { NextAuthOptions } from "next-auth";
import { env } from "@/env";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
    signIn({ account }) {
      if (account?.provider !== "discord") return false;
      console.log(account.providerAccountId);
      return env.ALLOWED_DISCORD_IDS.has(account.providerAccountId as string);
    },
  },
  providers: [
    Discord({
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
    }),
  ],
};
