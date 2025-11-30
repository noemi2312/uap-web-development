// app/api/tasks/[id]/route.ts
import { NextRequest } from 'next/server'
import { db } from '../../../lib/db'
import { taskUpdateSchema } from '../../../lib/validations'

interface RouteParams {
  params: { id: string }
}

// GET /api/tasks/[id] - Obtener tarea específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tasks = await db.getTasks()
    const task = tasks.find(t => t.id === params.id)
    
    if (!task) {
      return Response.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    return Response.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error(`GET /api/tasks/${params.id} error:`, error)
    return Response.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - Actualizar tarea
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada con taskUpdateSchema (campos opcionales)
    const validatedData = taskUpdateSchema.parse(body)
    
    // Actualizar la tarea
    const updatedTask = await db.updateTask(params.id, validatedData)
    
    if (!updatedTask) {
      return Response.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    return Response.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    })
  } catch (error) {
    console.error(`PUT /api/tasks/${params.id} error:`, error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return Response.json(
        { success: false, error: 'Invalid task data', details: error.message },
        { status: 400 }
      )
    }
    
    return Response.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Eliminar tarea
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const deleted = await db.deleteTask(params.id)
    
    if (!deleted) {
      return Response.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    return Response.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error(`DELETE /api/tasks/${params.id} error:`, error)
    return Response.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}