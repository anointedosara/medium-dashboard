import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserProvider } from "@/components/dashboard/UserProvider";
import { Shell } from "@/components/dashboard/Shell";

// This layout reads cookies and is user-specific, so it always renders
// dynamically. (Instant-navigation validation via `unstable_instant` is only
// available with Cache Components enabled, which this app does not use.)
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <UserProvider initialUser={user}>
      <Shell>{children}</Shell>
    </UserProvider>
  );
}
