import { z } from "zod";

// MongoDB ObjectId
const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Pagination query
const paginationSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").optional(),

  limit: z.coerce
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
});

// GET ALL USERS
const getAllUsersSchema = z.object({
  page: z.coerce.number().min(1).optional(),

  limit: z.coerce.number().min(1).max(100).optional(),

  search: z.string().trim().max(50, "Search too long").optional(),

  blocked: z
    .enum(["true", "false"])
    .or(z.literal(""))
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

// PARAM ID VALIDATION
const userIdParamSchema = z.object({
  id: objectIdSchema,
});

// ACTIVE SESSIONS
const getActiveSessionsSchema = paginationSchema;

// SECURITY LOGS
const getSecurityLogsSchema = z.object({
  page: z.coerce.number().min(1).optional(),

  limit: z.coerce.number().min(1).max(100).optional(),

  action: z.string().trim().optional(),

  status: z.string().trim().optional(),
});

export {
  getAllUsersSchema,
  userIdParamSchema,
  getActiveSessionsSchema,
  getSecurityLogsSchema,
};
