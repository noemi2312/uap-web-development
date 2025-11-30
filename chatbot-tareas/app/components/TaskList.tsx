// app/components/TaskList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Task } from '../lib/db'

interface TaskListProps {
  tasks?: Task[]
  refreshTrigger?: number
  onTaskUpdate?: () => void
}

export default function TaskList({ tasks: initialTasks, refreshTrigger, onTaskUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [])
  const [loading, setLoading] = useState(!initialTasks)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt')

  // Cargar tareas si no se pasan como prop
  useEffect(() => {
    if (!initialTasks) {
      loadTasks()
    } else {
      setTasks(initialTasks)
    }
  }, [initialTasks, refreshTrigger])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      const result = await response.json()
      
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar tareas según el filtro seleccionado
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // Ordenar tareas
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      })

      const result = await response.json()

      if (result.success) {
        // Actualizar estado local
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, completed: !completed } : task
        ))
        onTaskUpdate?.()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDelete = async (taskId: string, taskTitle: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // Eliminar del estado local
        setTasks(tasks.filter(task => task.id !== taskId))
        onTaskUpdate?.()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'work': return '💼'
      case 'personal': return '🏠'
      case 'shopping': return '🛒'
      case 'health': return '🏥'
      case 'other': return '📝'
      default: return '📌'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando tareas...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Mis Tareas ({sortedTasks.length})
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Filtros */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>

          {/* Ordenamiento */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Más recientes</option>
            <option value="dueDate">Fecha límite</option>
            <option value="priority">Prioridad</option>
          </select>

          {/* Botón recargar */}
          <button
            onClick={loadTasks}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de tareas */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {filter === 'completed' ? 'No hay tareas completadas' : 
             filter === 'pending' ? '¡No hay tareas pendientes!' : 
             'No hay tareas'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Comienza creando tu primera tarea en el chat.' :
             '¡Excelente trabajo! No hay tareas en esta categoría.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                task.completed 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>

                  {/* Contenido de la tarea */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className={`font-medium text-lg ${
                        task.completed ? 'line-through text-gray-600' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {/* Badges */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : 
                         task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {getCategoryIcon(task.category)} {task.category}
                      </span>
                    </div>

                    {/* Metadatos */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        📅 Creada: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      
                      {task.dueDate && (
                        <span className={new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-600 font-medium' : ''}>
                          ⏰ Vence: {new Date(task.dueDate).toLocaleDateString()}
                          {new Date(task.dueDate) < new Date() && !task.completed && ' (Atrasada)'}
                        </span>
                      )}
                      
                      <span>
                        {task.completed ? '✅ Completada' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDelete(task.id, task.title)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Eliminar tarea"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{tasks.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => !t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length}
              </div>
              <div className="text-sm text-gray-600">Atrasadas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}