// app/api/tasks/stats/route.ts
import { NextRequest } from 'next/server'
import { db } from '../../../lib/db'

// GET /api/tasks/stats - Obtener estadísticas
export async function GET(request: NextRequest) {
  try {
    const tasks = await db.getTasks()
    
    // Calcular estadísticas básicas
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    // Estadísticas por prioridad
    const byPriority = {
      high: tasks.filter(t => t.priority === 'high'),
      medium: tasks.filter(t => t.priority === 'medium'), 
      low: tasks.filter(t => t.priority === 'low')
    }
    
    // Estadísticas por categoría
    const byCategory = {
      work: tasks.filter(t => t.category === 'work'),
      personal: tasks.filter(t => t.category === 'personal'),
      shopping: tasks.filter(t => t.category === 'shopping'),
      health: tasks.filter(t => t.category === 'health'),
      other: tasks.filter(t => t.category === 'other')
    }
    
    // Tareas próximas a vencer
    const now = new Date()
    const dueToday = tasks.filter(t => 
      t.dueDate && 
      !t.completed && 
      new Date(t.dueDate).toDateString() === now.toDateString()
    )
    
    const overdue = tasks.filter(t => 
      t.dueDate && 
      !t.completed && 
      new Date(t.dueDate) < now
    )

    const stats = {
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: Math.round(completionRate),
        overdueTasks: overdue.length
      },
      byPriority: {
        high: { total: byPriority.high.length, completed: byPriority.high.filter(t => t.completed).length },
        medium: { total: byPriority.medium.length, completed: byPriority.medium.filter(t => t.completed).length },
        low: { total: byPriority.low.length, completed: byPriority.low.filter(t => t.completed).length }
      },
      byCategory: {
        work: { total: byCategory.work.length, completed: byCategory.work.filter(t => t.completed).length },
        personal: { total: byCategory.personal.length, completed: byCategory.personal.filter(t => t.completed).length },
        shopping: { total: byCategory.shopping.length, completed: byCategory.shopping.filter(t => t.completed).length },
        health: { total: byCategory.health.length, completed: byCategory.health.filter(t => t.completed).length },
        other: { total: byCategory.other.length, completed: byCategory.other.filter(t => t.completed).length }
      },
      upcoming: {
        dueTodayCount: dueToday.length,
        overdueCount: overdue.length
      }
    }

    return Response.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('GET /api/tasks/stats error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}