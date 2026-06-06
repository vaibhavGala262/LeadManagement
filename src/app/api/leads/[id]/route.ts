import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema, LeadStatusEnum } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (body.status) {
      const statusValidation = LeadStatusEnum.safeParse(body.status);
      if (!statusValidation.success) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      const lead = await prisma.lead.update({
        where: { id },
        data: { status: statusValidation.data },
      });

      return NextResponse.json({ data: lead });
    }

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

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone || null,
        company: validation.data.company || null,
        status: validation.data.status || existing.status,
        notes: validation.data.notes || null,
      },
    });

    return NextResponse.json({ data: lead });
  } catch (error) {
    console.error("PUT /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
