import { z } from 'zod'

const uuidSchema = z.string().uuid('Invalid UUID format')
const emailSchema = z.string().email('Invalid email format').optional()
const dateSchema = z.string().datetime('Invalid date format').optional()

// ─── Client ───────────────────────────────────────────────────
export const createClientSchema = z.object({
  startup_id: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema.nullable(),
  phone: z.string().max(30).optional().nullable(),
  // Contact detail fields
  birthday: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  referred_by: uuidSchema.optional().nullable(),
  // Financial detail fields
  income_range: z.string().max(100).optional().nullable(),
  income_source: z.string().max(100).optional().nullable(),
  savings: z.string().max(100).optional().nullable(),
  investments: z.string().max(200).optional().nullable(),
  debt_notes: z.string().max(1000).optional().nullable(),
  finance_tools: z.array(z.string().max(50)).optional().nullable(),
  goals: z.array(z.object({
    title: z.string().min(1),
    status: z.enum(['in_progress', 'complete']),
  })).optional().nullable(),
  challenges: z.string().max(1000).optional().nullable(),
  // Pipeline
  lead_stage: z.enum(['lead', 'discovery', 'active', 'paused', 'cold']).default('lead'),
  notes: z.string().max(1000).optional().nullable(),
})

export const updateClientSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100, 'Name too long').optional(),
  email: emailSchema.nullable(),
  phone: z.string().max(30).optional().nullable(),
  birthday: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  referred_by: uuidSchema.optional().nullable(),
  income_range: z.string().max(100).optional().nullable(),
  income_source: z.string().max(100).optional().nullable(),
  savings: z.string().max(100).optional().nullable(),
  investments: z.string().max(200).optional().nullable(),
  debt_notes: z.string().max(1000).optional().nullable(),
  finance_tools: z.array(z.string().max(50)).optional().nullable(),
  goals: z.array(z.object({
    title: z.string().min(1),
    status: z.enum(['in_progress', 'complete']),
  })).optional().nullable(),
  challenges: z.string().max(1000).optional().nullable(),
  lead_stage: z.enum(['lead', 'discovery', 'active', 'paused', 'cold']).optional(),
  notes: z.string().max(1000).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ─── Task ─────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  startup_id: uuidSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['pending', 'on_hold', 'completed', 'abandoned']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().nullable(),
  due_date: dateSchema.nullable(),
  client_id: uuidSchema.optional().nullable(),
  project_id: uuidSchema.optional().nullable(),
  milestone_id: uuidSchema.optional().nullable(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['pending', 'on_hold', 'completed', 'abandoned']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().nullable(),
  due_date: dateSchema.nullable(),
  client_id: uuidSchema.optional().nullable(),
  project_id: uuidSchema.optional().nullable(),
  milestone_id: uuidSchema.optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ─── Meeting ──────────────────────────────────────────────────
export const createMeetingSchema = z.object({
  startup_id: uuidSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  date: z.string().datetime('Invalid date format'),
  notes: z.string().max(2000).optional().nullable(),
  attendees: z.array(z.string().max(100)).optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  meeting_type: z.enum(['discovery', 'session', 'internal']).default('session'),
  duration_minutes: z.number().int().positive().optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

export const updateMeetingSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  notes: z.string().max(2000).optional().nullable(),
  attendees: z.array(z.string().max(100)).optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  meeting_type: z.enum(['discovery', 'session', 'internal']).optional(),
  duration_minutes: z.number().int().positive().optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ─── Note ─────────────────────────────────────────────────────
export const createNoteSchema = z.object({
  startup_id: uuidSchema,
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  tags: z.array(z.string().max(50)).optional().nullable(),
})

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(5000, 'Content too long').optional(),
  tags: z.array(z.string().max(50)).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ─── Milestone ────────────────────────────────────────────────
export const createMilestoneSchema = z.object({
  startup_id: uuidSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional().nullable(),
  target_date: dateSchema.nullable(),
  status: z.enum(['upcoming', 'in_progress', 'achieved']).default('upcoming'),
})

export const updateMilestoneSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  description: z.string().max(1000).optional().nullable(),
  target_date: dateSchema.nullable(),
  status: z.enum(['upcoming', 'in_progress', 'achieved']).optional(),
  completed_at: dateSchema.nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ─── Project ──────────────────────────────────────────────────
export const createProjectSchema = z.object({
  startup_id: uuidSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['active', 'on_hold', 'complete']).default('active'),
  due_date: z.string().optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  milestone_id: uuidSchema.optional().nullable(),
})

export const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['active', 'on_hold', 'complete']).optional(),
  due_date: z.string().optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  milestone_id: uuidSchema.optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// ─── Query schemas ────────────────────────────────────────────
export const clientQuerySchema = z.object({
  startup_id: uuidSchema.optional(),
  lead_stage: z.enum(['lead', 'discovery', 'active', 'paused', 'cold']).optional(),
})

export const taskQuerySchema = z.object({
  startup_id: uuidSchema.optional(),
  status: z.enum(['pending', 'on_hold', 'completed', 'abandoned']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  client_id: uuidSchema.optional(),
  project_id: uuidSchema.optional(),
  milestone_id: uuidSchema.optional(),
})

export const meetingQuerySchema = z.object({
  startup_id: uuidSchema.optional(),
  client_id: uuidSchema.optional(),
})

export const noteQuerySchema = z.object({
  startup_id: uuidSchema.optional(),
  tag: z.string().max(50).optional(),
})

export const milestoneQuerySchema = z.object({
  startup_id: uuidSchema.optional(),
  status: z.enum(['upcoming', 'in_progress', 'achieved']).optional(),
})

export const projectQuerySchema = z.object({
  startup_id: uuidSchema.optional(),
  status: z.enum(['active', 'on_hold', 'complete']).optional(),
  client_id: uuidSchema.optional(),
  milestone_id: uuidSchema.optional(),
})

// ─── Validation helper ────────────────────────────────────────
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'request'
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join(', ')
      return { success: false, error: `Validation error in ${context}: ${errorMessage}` }
    }
    return { success: false, error: `Unexpected validation error in ${context}` }
  }
}
