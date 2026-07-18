import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    avatar?: string | null;
  }
}