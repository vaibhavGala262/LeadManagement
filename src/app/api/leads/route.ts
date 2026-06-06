import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema, LeadStatusEnum } from "@/lib/validations";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const status = searchParams.get("status");
    const search = searchParams.get("q") || searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const allowedSortFields = ["name", "email", "company", "status", "createdAt", "updatedAt"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where: Prisma.LeadWhereInput = {};

    if (status) {
      const parsedStatus = LeadStatusEnum.safeParse(status);
      if (parsedStatus.success) {
        where.status = parsedStatus.data;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [safeSortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch leads", detail: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = leadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
        company: validation.data.company || null,
        status: validation.data.status || "NEW",
        notes: validation.data.notes || null,
      },
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create lead", detail: message },
      { status: 500 }
    );
  }
}
