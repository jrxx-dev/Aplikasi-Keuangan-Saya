import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // Check auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <p className="text-lg mb-2">Welcome, {user.email}!</p>
          <p className="text-muted-foreground">Dashboard content loading...</p>
          <p className="text-sm mt-4 text-muted-foreground">Authenticated as: {user.id}</p>
        </div>
      </div>
    </div>
  );
}
