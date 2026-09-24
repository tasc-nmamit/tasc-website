import { Role } from "@prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      usn?: string | null;
      role: Role;
      isAiml: boolean;
      year: number | null;
      branch: string | null;
      onboardingComplete: boolean;
    };
  }
}
