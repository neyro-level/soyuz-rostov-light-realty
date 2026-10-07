import { z } from "zod";
import type { LeadSubmission } from "./types";

const LeadSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[^\d+]/g, ""))
    .refine((value) => /^\+?\d{10,15}$/.test(value), {
      message: "phone",
    }),
  consent: z.boolean(),
  pageKey: z.string().trim().min(1).max(80).optional(),
  publicUrlId: z.string().trim().min(1).max(32).optional(),
  website: z.string().max(200).optional(),
});

export function parseLeadSubmission(
  input: unknown,
): { ok: true; value: LeadSubmission } | { ok: false } {
  const parsed = LeadSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false };
  }
  return { ok: true, value: parsed.data };
}
