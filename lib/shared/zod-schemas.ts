import { z } from "zod";

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  type: z.enum(["TRIP", "HOME", "COUPLE", "OTHER"]),
  defaultCurrency: z.string().default("INR"),
});

export const AddMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
});

export const CreateExpenseSchema = z.object({
  groupId: z.string().uuid(),
  description: z.string().min(1).max(200),
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().default("INR"),
  paidById: z.string().uuid(),
  category: z.string(),
  notes: z.string().optional(),
  expenseDate: z.string().date(),
  splitMethod: z.enum(["EQUAL", "EXACT"]),
  participants: z.array(z.string().uuid()).min(1),
  // For EXACT splits: map of userId -> amount
  exactAmounts: z.record(z.string(), z.number()).optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial().extend({
  groupId: z.string().uuid(),
});

export const CreateSettlementSchema = z.object({
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().positive().multipleOf(0.01),
  currency: z.string().default("INR"),
  method: z.enum(["CASH", "UPI", "OTHER"]),
  note: z.string().optional(),
  settledAt: z.string().datetime().optional(),
});

export const CreateCommentSchema = z.object({
  body: z.string().min(1).max(500),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  upiId: z.string().optional(),
  defaultCurrency: z.string().optional(),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type CreateSettlementInput = z.infer<typeof CreateSettlementSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
