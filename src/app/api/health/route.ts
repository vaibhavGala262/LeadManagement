import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import("@/generated/prisma/client");
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL.replace(/(\?|&)sslmode=[^&]*/g, "").replace(/[?&]$/g, ""),
        ssl: { rejectUnauthorized: false },
      });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });
      await prisma.$connect();
      const count = await prisma.lead.count();
      await prisma.$disconnect();
      checks.db = { connected: true, leadCount: count };
    } catch (error) {
      checks.db = {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return NextResponse.json(checks);
}
