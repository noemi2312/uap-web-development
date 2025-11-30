// app/lib/validations.ts
import { z } from 'zod'

// Schema para CREAR tarea (título requerido)
export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'other']).default('other'),
  dueDate: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    'Invalid date format'
  )
})

// Schema para ACTUALIZAR tarea (todos los campos opcionales)
export const taskUpdateSchema = taskCreateSchema.partial()

export type TaskInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>