import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true, // Allow standard email/password registration and login
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy_client_secret",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // Cache session data in a signed cookie for 1 day
    },
  },
});
