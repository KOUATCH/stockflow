import { getDashboardOverview } from "@/actions/analytics";
import DashboardMain from "@/components/dashboard/DashboardMain";
import DefaultUserDashboard from "@/components/dashboard/DefaultUserDashboard";
import OverViewCard from "@/components/OverViewCard";
import { authOptions } from "@/config/auth";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getServerSession } from "next-auth";

export default async function Dashboard() {
  const analytics = (await getDashboardOverview()) || [];
  const session = await getServerSession(authOptions)
  const user = await getAuthenticatedUser();
  const userPermissions = user.permissions
  const hasPermission = userPermissions.includes('dashboard.read')
  if (!hasPermission) {
    return <DefaultUserDashboard user={user} />
  }
  console.log(session?.user)
  return (
    <main>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight   mb-4">
            Company Name: {(user?.organizationName ?? "").toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground">
            Company ID: {user.organizationId}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {analytics.map((item, i) => (
            <OverViewCard item={item} key={i} />
          ))}
        </div>
      </div>
      <DashboardMain />
    </main>
  );
}
