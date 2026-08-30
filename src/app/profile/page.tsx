import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-blueprint-grid">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <span className="font-mono-tech text-xs text-brand-accent uppercase tracking-widest block mb-1">
            [ STUDENT_PROFILE // DATA_CENTER ]
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-space-grotesk text-foreground">
            Edit <span className="text-gold">Profile</span>
          </h1>
        </div>
        <ProfileClient user={user} />
      </div>
    </main>
  );
}
