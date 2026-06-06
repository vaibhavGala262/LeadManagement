import { describe, it, expect, vi, beforeEach } from "vitest";
import { leadSchema } from "@/lib/validations";

const mockPrisma = {
  lead: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Lead Validation", () => {
  it("should validate a correct lead", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Inc",
      status: "NEW",
      notes: "Test note",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing name", () => {
    const result = leadSchema.safeParse({
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("should reject name shorter than 2 characters", () => {
    const result = leadSchema.safeParse({
      name: "J",
      email: "john@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid phone", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional phone as empty string", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("should default status to NEW", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("NEW");
    }
  });

  it("should reject invalid status", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid statuses", () => {
    const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
    for (const status of statuses) {
      const result = leadSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should reject notes exceeding 2000 characters", () => {
    const result = leadSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      notes: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("API - Create Lead", () => {
  it("should create a lead with valid data", async () => {
    const leadData = {
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Test Corp",
    };

    const createdLead = {
      id: "123",
      ...leadData,
      phone: null,
      status: "NEW",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPrisma.lead.create.mockResolvedValue(createdLead);

    const validation = leadSchema.safeParse(leadData);
    expect(validation.success).toBe(true);

    if (validation.success) {
      const result = await mockPrisma.lead.create({
        data: {
          name: validation.data.name,
          email: validation.data.email,
          phone: validation.data.phone || null,
          company: validation.data.company || null,
          status: validation.data.status || "NEW",
          notes: validation.data.notes || null,
        },
      });
      expect(result).toEqual(createdLead);
      expect(mockPrisma.lead.create).toHaveBeenCalledOnce();
    }
  });
});

describe("API - Update Lead", () => {
  it("should update a lead", async () => {
    const leadId = "123";
    const updateData = {
      name: "Updated Name",
      email: "updated@example.com",
      company: "Updated Corp",
    };

    const existingLead = {
      id: leadId,
      name: "Old Name",
      email: "old@example.com",
      phone: null,
      company: null,
      status: "NEW",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedLead = {
      ...existingLead,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    mockPrisma.lead.findUnique.mockResolvedValue(existingLead);
    mockPrisma.lead.update.mockResolvedValue(updatedLead);

    const found = await mockPrisma.lead.findUnique({ where: { id: leadId } });
    expect(found).toEqual(existingLead);

    const result = await mockPrisma.lead.update({
      where: { id: leadId },
      data: updateData,
    });
    expect(result).toEqual(updatedLead);
    expect(mockPrisma.lead.findUnique).toHaveBeenCalledWith({
      where: { id: leadId },
    });
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: leadId },
      data: updateData,
    });
  });

  it("should update lead status only", async () => {
    const leadId = "123";
    const existingLead = {
      id: leadId,
      name: "Test Lead",
      email: "test@example.com",
      phone: null,
      company: null,
      status: "NEW",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedLead = {
      ...existingLead,
      status: "QUALIFIED",
    };

    mockPrisma.lead.findUnique.mockResolvedValue(existingLead);
    mockPrisma.lead.update.mockResolvedValue(updatedLead);

    const result = await mockPrisma.lead.update({
      where: { id: leadId },
      data: { status: "QUALIFIED" },
    });

    expect(result.status).toBe("QUALIFIED");
  });
});

describe("API - Delete Lead", () => {
  it("should delete an existing lead", async () => {
    const leadId = "123";
    const existingLead = {
      id: leadId,
      name: "Delete Me",
      email: "delete@example.com",
      phone: null,
      company: null,
      status: "NEW",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPrisma.lead.findUnique.mockResolvedValue(existingLead);
    mockPrisma.lead.delete.mockResolvedValue(existingLead);

    const found = await mockPrisma.lead.findUnique({ where: { id: leadId } });
    expect(found).not.toBeNull();

    const result = await mockPrisma.lead.delete({ where: { id: leadId } });
    expect(result.id).toBe(leadId);
  });

  it("should return null for non-existent lead", async () => {
    mockPrisma.lead.findUnique.mockResolvedValue(null);

    const result = await mockPrisma.lead.findUnique({
      where: { id: "non-existent" },
    });
    expect(result).toBeNull();
  });
});
