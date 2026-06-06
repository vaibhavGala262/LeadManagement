"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { StatsCard, StatsCardSkeleton } from "@/components/dashboard/stats-card";
import { LeadsChart, LeadsChartSkeleton } from "@/components/dashboard/leads-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/leads/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRelative } from "@/lib/utils";

interface DashboardData {
  stats: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  };
  distribution: { status: string; count: number }[];
  recentLeads: {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/leads?limit=100&sortBy=createdAt&order=desc");
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();

        const leads = json.data;
        const total = json.pagination.total;
        const newLeads = leads.filter((l: { status: string }) => l.status === "NEW").length;
        const contacted = leads.filter((l: { status: string }) => l.status === "CONTACTED").length;
        const qualified = leads.filter((l: { status: string }) => l.status === "QUALIFIED").length;
        const converted = leads.filter((l: { status: string }) => l.status === "CONVERTED").length;
        const lost = leads.filter((l: { status: string }) => l.status === "LOST").length;

        const statusCounts: Record<string, number> = {
          NEW: 0,
          CONTACTED: 0,
          QUALIFIED: 0,
          CONVERTED: 0,
          LOST: 0,
        };
        leads.forEach((l: { status: string }) => {
          if (statusCounts[l.status] !== undefined) statusCounts[l.status]++;
        });

        const distribution = Object.entries(statusCounts)
          .filter(([, count]) => count > 0)
          .map(([status, count]) => ({ status, count }));

        setData({
          stats: { total, new: newLeads, contacted, qualified, converted, lost },
          distribution,
          recentLeads: leads.slice(0, 5),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-4 text-sm font-semibold">Failed to load dashboard</h3>
        <p className="mt-1 text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of your lead pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </>
        ) : data ? (
          <>
            <StatsCard
              title="Total Leads"
              value={data.stats.total}
              icon={<Users className="h-6 w-6" />}
              description="All leads in pipeline"
            />
            <StatsCard
              title="New Leads"
              value={data.stats.new}
              icon={<UserPlus className="h-6 w-6" />}
              description="Awaiting contact"
              trend={{ value: `${Math.round((data.stats.new / Math.max(data.stats.total, 1)) * 100)}%`, positive: true }}
            />
            <StatsCard
              title="Qualified"
              value={data.stats.qualified}
              icon={<Star className="h-6 w-6" />}
              description="Ready for conversion"
            />
            <StatsCard
              title="Converted"
              value={data.stats.converted}
              icon={<CheckCircle2 className="h-6 w-6" />}
              description="Successfully converted"
              trend={{ value: `${Math.round((data.stats.converted / Math.max(data.stats.total, 1)) * 100)}%`, positive: true }}
            />
            <StatsCard
              title="Lost"
              value={data.stats.lost}
              icon={<XCircle className="h-6 w-6" />}
              description="Closed lost"
              trend={{ value: `${Math.round((data.stats.lost / Math.max(data.stats.total, 1)) * 100)}%`, positive: false }}
            />
          </>
        ) : null}
      </div>

      {/* Charts & Recent Leads */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-zinc-500" />
              Lead Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LeadsChartSkeleton />
            ) : (
              <LeadsChart data={data?.distribution || []} />
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.recentLeads.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No leads yet
              </p>
            ) : (
              <div className="space-y-1">
                {data?.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{lead.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {formatDateRelative(lead.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
