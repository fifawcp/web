import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(3, "errors.nameMinLength").max(20, "errors.nameMaxLength").trim(),
});

export const joinBoardSchema = z.object({
  join_code: z
    .string()
    .length(8, "errors.joinCodeLength")
    .regex(/^[A-Z0-9]+$/, "errors.joinCodeFormat")
    .trim(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1, "errors.nameMinLength").max(20, "errors.nameMaxLength").trim(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export type CreateBoardFormData = z.infer<typeof createBoardSchema>;
export type JoinBoardFormData = z.infer<typeof joinBoardSchema>;
export type UpdateBoardFormData = z.infer<typeof updateBoardSchema>;
export type UpdateMemberRoleFormData = z.infer<typeof updateMemberRoleSchema>;
