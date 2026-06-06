import { z } from "zod";

export const LeadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
]);

export type LeadStatus = z.infer<typeof LeadStatusEnum>;

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(200, "Company must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  status: LeadStatusEnum.default("NEW").optional(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .optional()
    .or(z.literal("")),
});

export type LeadFormData = z.infer<typeof leadSchema>;
