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
    <main className="min-h-dvh px-4 pt-28 pb-16 bg-[url('/grid-pattern.svg')] bg-fixed">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Edit Profile</h1>
        <ProfileClient user={user} />
      </div>
    </main>
  );
}
