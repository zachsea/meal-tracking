import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MONGODB_URI: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    DISCORD_ID: z.string().min(1),
    DISCORD_SECRET: z.string().min(1),
    ALLOWED_DISCORD_IDS: z
      .string()
      .transform((s) => new Set(s.split(",").map((id) => id.trim()))),
  },
  client: {},
  runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_ID: process.env.DISCORD_ID,
    DISCORD_SECRET: process.env.DISCORD_SECRET,
    ALLOWED_DISCORD_IDS: process.env.ALLOWED_DISCORD_IDS,
  },
});
