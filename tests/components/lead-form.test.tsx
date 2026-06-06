import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "@/components/leads/lead-form";

describe("LeadForm", () => {
  it("renders create mode correctly", () => {
    render(
      <LeadForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("Create Lead")).toBeDefined();
    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/phone/i)).toBeDefined();
    expect(screen.getByLabelText(/company/i)).toBeDefined();
    expect(screen.getByLabelText(/notes/i)).toBeDefined();
  });

  it("renders edit mode correctly", () => {
    const lead = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Inc",
      status: "NEW" as const,
      notes: "Test note",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <LeadForm
        lead={lead}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("Update Lead")).toBeDefined();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <LeadForm
        onSubmit={vi.fn()}
        onCancel={handleCancel}
        isSubmitting={false}
      />
    );

    await user.click(screen.getByText("Cancel"));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it("shows submitting state", () => {
    render(
      <LeadForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByText("Create Lead");
    expect(submitButton).toBeDefined();
  });
});
