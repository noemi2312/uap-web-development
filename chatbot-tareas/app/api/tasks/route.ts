// app/api/tasks/route.ts
import { NextRequest } from 'next/server'
import { db } from '../../lib/db'
import { taskCreateSchema } from '../../lib/validations'  // ← SOLO taskCreateSchema aquí

// GET /api/tasks - Listar tareas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Obtener parámetros de filtro
    const query = searchParams.get('query') || undefined
    const completed = searchParams.get('completed') 
      ? searchParams.get('completed') === 'true' 
      : undefined
    const priority = searchParams.get('priority') as any
    const category = searchParams.get('category') as any

    let tasks
    if (query || completed !== undefined || priority || category) {
      // Usar búsqueda con filtros
      tasks = await db.searchTasks({
        query,
        completed,
        priority,
        category
      })
    } else {
      // Obtener todas las tareas
      tasks = await db.getTasks()
    }

    return Response.json({
      success: true,
      data: tasks,
      total: tasks.length
    })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Crear nueva tarea
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada con taskCreateSchema (título requerido)
    const validatedData = taskCreateSchema.parse(body)
    
    // Crear la tarea
    const newTask = await db.createTask(validatedData)
    
    return Response.json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        { success: false, error: 'Invalid task data', details: error.message },
        { status: 400 }
      )
    }
    
    return Response.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}