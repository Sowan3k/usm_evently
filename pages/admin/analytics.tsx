import type { GetServerSideProps } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect, adminRedirect } from "@/lib/page-auth";
import type {
  MonthPoint,
  CategoryPoint,
  RevenuePoint,
} from "../../components/AnalyticsCharts";

// Charts render on the client only (recharts needs the DOM).
const AnalyticsCharts = dynamic(
  () => import("../../components/AnalyticsCharts"),
  { ssr: false, loading: () => <p className="text-gray-400">Loading charts…</p> }
);

type Stats = {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  monthly: MonthPoint[];
  categories: CategoryPoint[];
  revenue: RevenuePoint[];
};

export const getServerSideProps: GetServerSideProps<Stats> = async (ctx) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;
  if (session.user.role !== "ADMIN") return adminRedirect;

  const [totalUsers, totalEvents, registrations, payments] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { createdAt: true, event: { select: { category: true } } },
    }),
    prisma.payment.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true, event: { select: { title: true } } },
    }),
  ]);

  // Registrations over the last 6 months.
  const months: MonthPoint[] = [];
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: fmt(d), registrations: 0 });
  }
  const idxOf = (d: Date) => {
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    return 5 - diff;
  };
  for (const r of registrations) {
    const i = idxOf(new Date(r.createdAt));
    if (i >= 0 && i < months.length) months[i].registrations += 1;
  }

  // Registrations by category.
  const catMap = new Map<string, number>();
  for (const r of registrations) {
    const c = r.event.category || "Uncategorised";
    catMap.set(c, (catMap.get(c) ?? 0) + 1);
  }
  const categories: CategoryPoint[] = [...catMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Revenue by event.
  const revMap = new Map<string, number>();
  let totalRevenue = 0;
  for (const p of payments) {
    totalRevenue += p.amount;
    const name = p.event?.title ?? "Other";
    revMap.set(name, (revMap.get(name) ?? 0) + p.amount);
  }
  const revenue: RevenuePoint[] = [...revMap.entries()]
    .map(([name, rev]) => ({
      name: name.length > 22 ? name.slice(0, 20) + "…" : name,
      revenue: Math.round(rev * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return {
    props: {
      totalUsers,
      totalEvents,
      totalRegistrations: registrations.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthly: months,
      categories,
      revenue,
    },
  };
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5 bg-white shadow-lg">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-usmPurple">{value}</p>
    </Card>
  );
}

export default function Analytics({
  totalUsers,
  totalEvents,
  totalRegistrations,
  totalRevenue,
  monthly,
  categories,
  revenue,
}: Stats) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <Link
            href="/admin"
            className="text-sm font-medium text-usmPurple hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat label="Total users" value={totalUsers} />
          <Stat label="Total events" value={totalEvents} />
          <Stat label="Registrations" value={totalRegistrations} />
          <Stat label="Revenue (RM)" value={totalRevenue.toFixed(2)} />
        </div>

        <AnalyticsCharts
          monthly={monthly}
          categories={categories}
          revenue={revenue}
        />
      </main>
      <Footer />
    </div>
  );
}
